import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { catchError, of } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { claimHttpError } from 'src/app/shared/utils/http-error.util';
import { AdminConsoleShellComponent } from '../../../shared/admin-console-shell.component';
import { resolveCustomFormsPermissions } from '../config/custom-forms.permissions';
import { CUSTOM_FORM_ENTITY_TYPES, FIELD_OPTIONS_NAMESPACE } from '../config/entity-types';
import { CustomFormsDataSource } from '../data/custom-forms-data.source';
import {
  CONDITION_OPERATORS,
  CUSTOM_FIELD_TYPES,
  type CustomFieldType,
  type CustomForm,
  type CustomFormField,
  type CustomFormPermissions,
  type CustomFormStatus,
  type FieldCondition,
  type UpsertCustomFormFieldInput,
} from '../domain';
import {
  emptyCondition,
  formatConditionValue,
  formatDependentOptionsText,
  formatOptionsText,
  formatPermissionList,
  parseConditionValue,
  parseDependentOptionsText,
  parseOptionsText,
  parsePermissionList,
} from '../utils/field-draft.util';

type EditorTab = 'details' | 'fields' | 'preview';

interface FieldDraft {
  id: string | null;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  mandatory: boolean;
  isHidden: boolean;
  isEncrypted: boolean;
  sortOrder: number;
  optionsText: string;
  conditionEnabled: boolean;
  condition: FieldCondition;
  conditionValueText: string;
  dependentEnabled: boolean;
  dependentDependsOnKey: string;
  dependentText: string;
  validationPattern: string;
  validationMessage: string;
  viewPermissionsText: string;
  stepId: string;
  stepName: string;
}

interface CreateDraft {
  entityType: string;
  key: string;
  label: string;
  description: string;
  managePermissions: string;
  readPermissions: string;
  writePermissions: string;
}

interface MetaDraft {
  label: string;
  description: string;
  managePermissions: string;
  readPermissions: string;
  writePermissions: string;
}

@Component({
  selector: 'app-custom-forms-console',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminConsoleShellComponent],
  templateUrl: './custom-forms-console.component.html',
  styleUrls: ['./custom-forms-console.component.scss'],
})
export class CustomFormsConsoleComponent implements OnInit {
  private readonly data = inject(CustomFormsDataSource);
  private readonly modal = inject(ModalService);
  private readonly auth = inject(AuthorizationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly entityTypes = CUSTOM_FORM_ENTITY_TYPES;
  protected readonly fieldTypes = CUSTOM_FIELD_TYPES;
  protected readonly conditionOperators = CONDITION_OPERATORS;
  protected readonly perms: CustomFormPermissions = resolveCustomFormsPermissions(this.auth);

  protected entityType = this.entityTypes[0]?.value ?? 'workflow';
  protected statusFilter: CustomFormStatus | '' = '';
  protected search = '';
  protected forms: CustomForm[] = [];
  protected selected: CustomForm | null = null;
  protected loading = false;
  protected detailLoading = false;
  protected saving = false;
  protected tab: EditorTab = 'fields';

  protected showCreate = false;
  protected createDraft: CreateDraft = this.blankCreate();
  protected metaDraft: MetaDraft = this.blankMeta();

  protected showFieldDrawer = false;
  protected fieldDrawerReadOnly = false;
  protected fieldDraft: FieldDraft = this.blankFieldDraft();

  /** Preview sample values keyed by field key. */
  protected previewValues: Record<string, unknown> = {};

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const entity = q.get('entity');
    if (entity && this.entityTypes.some(e => e.value === entity)) {
      this.entityType = entity;
    }
    const status = q.get('status');
    if (status === 'draft' || status === 'published' || status === 'disabled') {
      this.statusFilter = status;
    }
    const tab = q.get('tab');
    if (tab === 'details' || tab === 'fields' || tab === 'preview') {
      this.tab = tab;
    }
    this.reload(q.get('form') ?? undefined);
  }

  protected get filteredForms(): CustomForm[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.forms;
    return this.forms.filter(
      f => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q),
    );
  }

  protected get isDraft(): boolean {
    return this.selected?.status === 'draft';
  }

  protected get canEditStructure(): boolean {
    return !!this.selected && this.isDraft && this.perms.canUpdate;
  }

  protected get canSaveMeta(): boolean {
    return !!this.selected && this.selected.status !== 'disabled' && this.perms.canUpdate;
  }

  protected get sortedFields(): CustomFormField[] {
    return [...(this.selected?.fields ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  protected get previewFields(): CustomFormField[] {
    return this.sortedFields.filter(f => f.enabled && !f.isHidden && this.conditionMet(f));
  }

  reload(selectKeyOrId?: string): void {
    if (!this.entityType) return;
    this.loading = true;
    const status = this.statusFilter || undefined;
    this.data.listForms(this.entityType, status).pipe(
      catchError(err => {
        this.notify('Load failed', err?.message ?? 'Unable to load forms.', 'error', err);
        return of([] as CustomForm[]);
      }),
    ).subscribe(forms => {
      this.forms = forms;
      this.loading = false;
      this.syncQuery();
      const prefer = selectKeyOrId
        ?? this.selected?.id
        ?? this.selected?.key
        ?? this.route.snapshot.queryParamMap.get('form')
        ?? undefined;
      if (prefer) {
        const hit = forms.find(f => f.id === prefer || f.key === prefer);
        if (hit) {
          this.select(hit);
          return;
        }
      }
      if (this.selected && !forms.some(f => f.id === this.selected!.id)) {
        this.selected = null;
      }
    });
  }

  onEntityChange(): void {
    this.selected = null;
    this.reload();
  }

  onStatusChange(): void {
    this.reload();
  }

  select(form: CustomForm): void {
    this.detailLoading = true;
    this.showFieldDrawer = false;
    this.data.getForm(form.id).pipe(
      catchError(err => {
        this.notify('Load form failed', err?.message ?? 'Unable to load form detail.', 'error', err);
        return of(null);
      }),
    ).subscribe(detail => {
      this.detailLoading = false;
      if (!detail) return;
      this.selected = detail;
      this.metaDraft = {
        label: detail.label,
        description: detail.description ?? '',
        managePermissions: formatPermissionList(detail.managePermissions),
        readPermissions: formatPermissionList(detail.readPermissions),
        writePermissions: formatPermissionList(detail.writePermissions),
      };
      this.previewValues = {};
      this.syncQuery();
      // Refresh list row with field count from detail
      const idx = this.forms.findIndex(f => f.id === detail.id);
      if (idx >= 0) this.forms[idx] = { ...this.forms[idx], fields: detail.fields, status: detail.status };
    });
  }

  setTab(tab: EditorTab): void {
    this.tab = tab;
    this.syncQuery();
  }

  openCreate(): void {
    if (!this.perms.canCreate) return;
    this.createDraft = this.blankCreate();
    this.createDraft.entityType = this.entityType;
    this.showCreate = true;
  }

  closeCreate(): void {
    this.showCreate = false;
  }

  submitCreate(): void {
    const d = this.createDraft;
    if (!d.entityType || !d.key.trim() || !d.label.trim()) {
      this.notify('Missing fields', 'Entity type, key, and label are required.', 'error');
      return;
    }
    this.saving = true;
    this.data.createForm({
      entityType: d.entityType,
      key: d.key.trim(),
      label: d.label.trim(),
      description: d.description.trim() || null,
      managePermissions: parsePermissionList(d.managePermissions),
      readPermissions: parsePermissionList(d.readPermissions),
      writePermissions: parsePermissionList(d.writePermissions),
    }).subscribe({
      next: created => {
        this.saving = false;
        this.showCreate = false;
        this.entityType = created.entityType;
        this.notify('Form created', created.label, 'success');
        this.reload(created.id);
      },
      error: err => {
        this.saving = false;
        this.notify('Create failed', err?.message ?? 'Unable to create form.', 'error', err);
      },
    });
  }

  saveMeta(): void {
    if (!this.selected || !this.canSaveMeta) return;
    this.saving = true;
    this.data.updateForm(this.selected.id, {
      label: this.metaDraft.label.trim(),
      description: this.metaDraft.description.trim() || null,
      managePermissions: parsePermissionList(this.metaDraft.managePermissions),
      readPermissions: parsePermissionList(this.metaDraft.readPermissions),
      writePermissions: parsePermissionList(this.metaDraft.writePermissions),
    }).subscribe({
      next: updated => {
        this.saving = false;
        this.selected = { ...updated, fields: this.selected?.fields ?? updated.fields };
        this.notify('Saved', 'Form details updated.', 'success');
        this.reload(updated.id);
      },
      error: err => {
        this.saving = false;
        this.notify('Save failed', err?.message ?? 'Unable to save form.', 'error', err);
      },
    });
  }

  publish(): void {
    if (!this.selected || this.selected.status !== 'draft' || !this.perms.canUpdate) return;
    const form = this.selected;
    this.modal.openNotificationModal({
      title: 'Publish form?',
      description: `"${form.label}" will become published. Field structure cannot be changed afterward.`,
    }, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.saving = true;
      this.data.publishForm(form.id).subscribe({
        next: updated => {
          this.saving = false;
          this.notify('Published', updated.label, 'success');
          this.reload(updated.id);
        },
        error: err => {
          this.saving = false;
          this.notify('Publish failed', err?.message ?? 'Unable to publish.', 'error', err);
        },
      });
    });
  }

  disableForm(): void {
    if (!this.selected || this.selected.status === 'disabled' || !this.perms.canDisable) return;
    const form = this.selected;
    this.modal.openNotificationModal({
      title: 'Disable form?',
      description: `"${form.label}" will be disabled and no longer available to product flows.`,
    }, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.saving = true;
      this.data.disableForm(form.id).subscribe({
        next: updated => {
          this.saving = false;
          this.notify('Disabled', updated.label, 'success');
          this.reload(updated.id);
        },
        error: err => {
          this.saving = false;
          this.notify('Disable failed', err?.message ?? 'Unable to disable form.', 'error', err);
        },
      });
    });
  }

  openAddField(): void {
    if (!this.canEditStructure || !this.selected) return;
    const nextOrder = this.sortedFields.reduce((m, f) => Math.max(m, f.sortOrder), 0) + 1;
    this.fieldDraft = this.blankFieldDraft();
    this.fieldDraft.sortOrder = nextOrder;
    this.fieldDrawerReadOnly = false;
    this.showFieldDrawer = true;
  }

  openEditField(field: CustomFormField, readOnly = false): void {
    this.fieldDraft = {
      id: field.id,
      key: field.key,
      label: field.label,
      fieldType: field.fieldType,
      mandatory: field.mandatory,
      isHidden: field.isHidden,
      isEncrypted: field.isEncrypted,
      sortOrder: field.sortOrder,
      optionsText: formatOptionsText(field.fieldOptions),
      conditionEnabled: !!field.condition?.dependsOnKey,
      condition: field.condition ? { ...field.condition } : emptyCondition(),
      conditionValueText: formatConditionValue(field.condition?.value),
      dependentEnabled: !!field.dependentOptions?.dependsOnKey,
      dependentDependsOnKey: field.dependentOptions?.dependsOnKey ?? '',
      dependentText: formatDependentOptionsText(field.dependentOptions),
      validationPattern: field.validationRules?.patterns?.[0]?.pattern ?? '',
      validationMessage: field.validationRules?.patterns?.[0]?.regexErrMsg ?? '',
      viewPermissionsText: formatPermissionList(field.viewPermissions),
      stepId: field.stepId ?? '',
      stepName: field.stepName ?? '',
    };
    this.fieldDrawerReadOnly = readOnly || !this.canEditStructure;
    this.showFieldDrawer = true;
  }

  closeFieldDrawer(): void {
    this.showFieldDrawer = false;
  }

  get supportsOptions(): boolean {
    return this.fieldDraft.fieldType === 'select' || this.fieldDraft.fieldType === 'multiselect';
  }

  get supportsValidation(): boolean {
    return ['text', 'number', 'date'].includes(this.fieldDraft.fieldType);
  }

  saveField(): void {
    if (!this.selected || this.fieldDrawerReadOnly || !this.perms.canUpdate) return;
    const d = this.fieldDraft;
    if (!d.label.trim() || (!d.id && !d.key.trim())) {
      this.notify('Missing fields', 'Key and label are required.', 'error');
      return;
    }

    const input: UpsertCustomFormFieldInput = {
      key: d.key.trim(),
      label: d.label.trim(),
      fieldType: d.fieldType,
      mandatory: d.mandatory,
      sortOrder: d.sortOrder,
      isHidden: d.isHidden,
      isEncrypted: d.isEncrypted,
      fieldOptions: this.supportsOptions ? parseOptionsText(d.optionsText) : [],
      condition: d.conditionEnabled && d.condition.dependsOnKey.trim()
        ? {
            dependsOnKey: d.condition.dependsOnKey.trim(),
            operator: d.condition.operator,
            value: parseConditionValue(d.condition.operator, d.conditionValueText),
          }
        : null,
      dependentOptions: this.supportsOptions && d.dependentEnabled
        ? parseDependentOptionsText(d.dependentText, d.dependentDependsOnKey)
        : null,
      validationRules: this.supportsValidation && d.validationPattern.trim()
        ? {
            patterns: [{
              pattern: d.validationPattern.trim(),
              regexErrMsg: d.validationMessage.trim() || undefined,
            }],
          }
        : null,
      viewPermissions: parsePermissionList(d.viewPermissionsText),
      stepId: d.stepId.trim() || null,
      stepName: d.stepName.trim() || null,
    };

    this.saving = true;
    const req$ = d.id
      ? this.data.updateField(this.selected.id, d.id, input)
      : this.data.addField(this.selected.id, { ...input, key: d.key.trim() });

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showFieldDrawer = false;
        this.notify(d.id ? 'Field updated' : 'Field added', d.label, 'success');
        this.reload(this.selected!.id);
      },
      error: err => {
        this.saving = false;
        this.notify('Save field failed', err?.message ?? 'Unable to save field.', 'error', err);
      },
    });
  }

  disableField(field: CustomFormField): void {
    if (!this.selected || !this.perms.canDisable || !field.enabled) return;
    this.modal.openNotificationModal({
      title: 'Disable field?',
      description: `"${field.label}" will be disabled on this form.`,
    }, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.saving = true;
      this.data.disableField(this.selected!.id, field.id).subscribe({
        next: () => {
          this.saving = false;
          this.showFieldDrawer = false;
          this.notify('Field disabled', field.label, 'success');
          this.reload(this.selected!.id);
        },
        error: err => {
          this.saving = false;
          this.notify('Disable field failed', err?.message ?? 'Unable to disable field.', 'error', err);
        },
      });
    });
  }

  moveField(field: CustomFormField, direction: -1 | 1): void {
    if (!this.selected || !this.canEditStructure) return;
    const list = this.sortedFields;
    const idx = list.findIndex(f => f.id === field.id);
    const swap = idx + direction;
    if (idx < 0 || swap < 0 || swap >= list.length) return;

    const reordered = [...list];
    [reordered[idx], reordered[swap]] = [reordered[swap], reordered[idx]];
    const items = reordered.map((f, i) => ({ id: f.id, sortOrder: i + 1 }));

    this.saving = true;
    this.data.reorderFields(this.selected.id, items).subscribe({
      next: () => {
        this.saving = false;
        this.reload(this.selected!.id);
      },
      error: err => {
        this.saving = false;
        this.notify('Reorder failed', err?.message ?? 'Unable to reorder fields.', 'error', err);
      },
    });
  }

  openOptionsCatalog(fieldId?: string | null): void {
    const id = fieldId ?? this.fieldDraft.id;
    if (!id) return;
    void this.router.navigate([AppRoute.secured_admin_json_store_page.url], {
      queryParams: {
        ns: FIELD_OPTIONS_NAMESPACE,
        key: id,
        backTo: AppRoute.secured_admin_custom_forms_page.url,
        backLabel: 'Custom Forms',
      },
    });
  }

  disableFieldFromDrawer(): void {
    if (!this.selected || !this.fieldDraft.id) return;
    const existing = this.selected.fields.find(f => f.id === this.fieldDraft.id);
    if (existing) {
      this.disableField(existing);
      return;
    }
    this.disableField({
      id: this.fieldDraft.id,
      formId: this.selected.id,
      key: this.fieldDraft.key,
      label: this.fieldDraft.label,
      fieldType: this.fieldDraft.fieldType,
      mandatory: this.fieldDraft.mandatory,
      sortOrder: this.fieldDraft.sortOrder,
      enabled: true,
      isHidden: this.fieldDraft.isHidden,
      isEncrypted: this.fieldDraft.isEncrypted,
      fieldOptions: [],
      condition: null,
      dependentOptions: null,
      validationRules: null,
      viewPermissions: [],
      stepId: null,
      stepName: null,
      createdAt: '',
      updatedAt: null,
    });
  }

  conditionMet(field: CustomFormField): boolean {
    const c = field.condition;
    if (!c?.dependsOnKey) return true;
    const actual = this.previewValues[c.dependsOnKey];
    const expected = c.value;
    switch (c.operator) {
      case 'equals':
        return String(actual ?? '') === String(expected ?? '');
      case 'not_equals':
        return String(actual ?? '') !== String(expected ?? '');
      case 'in': {
        const list = Array.isArray(expected) ? expected.map(String) : [String(expected ?? '')];
        return list.includes(String(actual ?? ''));
      }
      case 'not_in': {
        const list = Array.isArray(expected) ? expected.map(String) : [String(expected ?? '')];
        return !list.includes(String(actual ?? ''));
      }
      default:
        return true;
    }
  }

  previewOptions(field: CustomFormField): Array<{ key: string; label: string }> {
    const dep = field.dependentOptions;
    if (dep?.dependsOnKey) {
      const parent = String(this.previewValues[dep.dependsOnKey] ?? '');
      const mapped = dep.optionMap?.[parent];
      if (mapped?.length) return mapped;
    }
    return field.fieldOptions ?? [];
  }

  setPreviewValue(key: string, value: unknown): void {
    this.previewValues = { ...this.previewValues, [key]: value };
  }

  onPreviewSelect(key: string, event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.setPreviewValue(key, el.value);
  }

  onPreviewMulti(key: string, event: Event): void {
    const el = event.target as HTMLSelectElement;
    const values = Array.from(el.selectedOptions).map(o => o.value);
    this.setPreviewValue(key, values);
  }

  onPreviewCheckbox(key: string, event: Event): void {
    const el = event.target as HTMLInputElement;
    this.setPreviewValue(key, el.checked);
  }

  statusBadge(status: CustomFormStatus): string {
    return `badge badge--${status}`;
  }

  private syncQuery(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        entity: this.entityType || null,
        status: this.statusFilter || null,
        form: this.selected?.key ?? null,
        tab: this.tab !== 'fields' ? this.tab : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private blankCreate(): CreateDraft {
    return {
      entityType: this.entityTypes[0]?.value ?? 'workflow',
      key: '',
      label: '',
      description: '',
      managePermissions: '',
      readPermissions: '',
      writePermissions: '',
    };
  }

  private blankMeta(): MetaDraft {
    return {
      label: '',
      description: '',
      managePermissions: '',
      readPermissions: '',
      writePermissions: '',
    };
  }

  private blankFieldDraft(): FieldDraft {
    return {
      id: null,
      key: '',
      label: '',
      fieldType: 'text',
      mandatory: false,
      isHidden: false,
      isEncrypted: false,
      sortOrder: 1,
      optionsText: '',
      conditionEnabled: false,
      condition: emptyCondition(),
      conditionValueText: '',
      dependentEnabled: false,
      dependentDependsOnKey: '',
      dependentText: '',
      validationPattern: '',
      validationMessage: '',
      viewPermissionsText: '',
      stepId: '',
      stepName: '',
    };
  }

  private notify(title: string, description: string, type: 'success' | 'error', error?: unknown): void {
    if (type === 'error') {
      claimHttpError(error);
    }
    this.modal.openNotificationModal({ title, description }, 'notification', type);
  }
}
