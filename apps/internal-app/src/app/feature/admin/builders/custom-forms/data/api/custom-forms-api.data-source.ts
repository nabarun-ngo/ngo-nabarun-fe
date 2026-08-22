import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CustomFormsFieldsService, CustomFormsService } from 'src/app/core/api/api-client/services';
import type {
  AddFormFieldDto,
  FormFieldDefinitionResponseDto,
  FormResponseDto,
  UpdateFormFieldDto,
} from 'src/app/core/api/api-client/models';
import type {
  CreateCustomFormInput,
  CustomForm,
  CustomFormField,
  CustomFormStatus,
  CustomFieldType,
  DependentOptions,
  FieldCondition,
  FieldOption,
  FieldValidationRules,
  UpdateCustomFormInput,
  UpsertCustomFormFieldInput,
} from '../../domain';
import { CustomFormsDataSource } from '../custom-forms-data.source';

function mapOptions(raw: Array<{ key: string; label: string }> | undefined): FieldOption[] {
  return (raw ?? []).map(o => ({ key: o.key, label: o.label }));
}

function mapCondition(raw: FormFieldDefinitionResponseDto['condition']): FieldCondition | null {
  if (!raw?.dependsOnKey) return null;
  return {
    dependsOnKey: raw.dependsOnKey,
    operator: raw.operator,
    value: raw.value,
  };
}

function mapDependent(raw: FormFieldDefinitionResponseDto['dependentOptions']): DependentOptions | null {
  if (!raw?.dependsOnKey) return null;
  const optionMap: Record<string, FieldOption[]> = {};
  const src = (raw.optionMap ?? {}) as Record<string, Array<{ key: string; label: string }>>;
  for (const [k, opts] of Object.entries(src)) {
    optionMap[k] = mapOptions(opts);
  }
  return { dependsOnKey: raw.dependsOnKey, optionMap };
}

function mapValidation(raw: FormFieldDefinitionResponseDto['validationRules']): FieldValidationRules | null {
  if (!raw?.patterns?.length) return null;
  return {
    patterns: raw.patterns.map(p => ({
      pattern: p.pattern,
      regexErrMsg: p.regexErrMsg,
    })),
  };
}

function mapField(dto: FormFieldDefinitionResponseDto): CustomFormField {
  return {
    id: dto.id,
    formId: dto.formId,
    key: dto.key,
    label: dto.label,
    fieldType: dto.fieldType as CustomFieldType,
    mandatory: !!dto.mandatory,
    sortOrder: dto.sortOrder ?? 0,
    enabled: dto.enabled !== false,
    isHidden: !!dto.isHidden,
    isEncrypted: !!dto.isEncrypted,
    fieldOptions: mapOptions(dto.fieldOptions),
    condition: mapCondition(dto.condition),
    dependentOptions: mapDependent(dto.dependentOptions),
    validationRules: mapValidation(dto.validationRules),
    viewPermissions: dto.viewPermissions ?? [],
    stepId: dto.stepId ?? null,
    stepName: dto.stepName ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
  };
}

function mapForm(dto: FormResponseDto): CustomForm {
  const fields = (dto.fields ?? []).map(mapField).sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: dto.id,
    entityType: dto.entityType,
    key: dto.key,
    label: dto.label,
    description: dto.description ?? null,
    status: dto.status,
    managePermissions: dto.managePermissions ?? [],
    readPermissions: dto.readPermissions ?? [],
    writePermissions: dto.writePermissions ?? [],
    fields,
    createdBy: dto.createdBy ?? null,
    publishedBy: dto.publishedBy ?? null,
    disabledBy: dto.disabledBy ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
  };
}

function toFieldBody(input: UpsertCustomFormFieldInput, includeKey: boolean): AddFormFieldDto | UpdateFormFieldDto {
  const body: AddFormFieldDto | UpdateFormFieldDto = {
    label: input.label,
    fieldType: input.fieldType,
    mandatory: input.mandatory,
    sortOrder: input.sortOrder,
    isHidden: input.isHidden,
    isEncrypted: input.isEncrypted,
    fieldOptions: input.fieldOptions,
    viewPermissions: input.viewPermissions,
    stepId: input.stepId ?? undefined,
    stepName: input.stepName ?? undefined,
    condition: input.condition
      ? {
          dependsOnKey: input.condition.dependsOnKey,
          operator: input.condition.operator,
          value: input.condition.value as {},
        }
      : input.condition === null
        ? null
        : undefined,
    dependentOptions: input.dependentOptions
      ? {
          dependsOnKey: input.dependentOptions.dependsOnKey,
          optionMap: input.dependentOptions.optionMap as {},
        }
      : input.dependentOptions === null
        ? null
        : undefined,
    validationRules: input.validationRules
      ? { patterns: input.validationRules.patterns }
      : input.validationRules === null
        ? null
        : undefined,
  };
  if (includeKey && input.key) {
    (body as AddFormFieldDto).key = input.key;
  }
  return body;
}

@Injectable()
export class CustomFormsApiDataSource extends CustomFormsDataSource {
  private readonly formsApi = inject(CustomFormsService);
  private readonly fieldsApi = inject(CustomFormsFieldsService);

  listForms(entityType: string, status?: CustomFormStatus): Observable<CustomForm[]> {
    return this.formsApi.formControllerListForms({ entityType, status }).pipe(
      map(r => (r.responsePayload ?? []).map(mapForm)),
    );
  }

  getForm(formId: string): Observable<CustomForm> {
    return this.formsApi.formControllerGetFormWithFields({ formId }).pipe(
      map(r => mapForm(r.responsePayload!)),
    );
  }

  createForm(input: CreateCustomFormInput): Observable<CustomForm> {
    return this.formsApi.formControllerCreateForm({
      body: {
        entityType: input.entityType,
        key: input.key,
        label: input.label,
        description: input.description,
        managePermissions: input.managePermissions,
        readPermissions: input.readPermissions,
        writePermissions: input.writePermissions,
      },
    }).pipe(map(r => mapForm(r.responsePayload!)));
  }

  updateForm(formId: string, input: UpdateCustomFormInput): Observable<CustomForm> {
    return this.formsApi.formControllerUpdateForm({
      formId,
      body: {
        label: input.label,
        description: input.description,
        managePermissions: input.managePermissions,
        readPermissions: input.readPermissions,
        writePermissions: input.writePermissions,
      },
    }).pipe(map(r => mapForm(r.responsePayload!)));
  }

  publishForm(formId: string): Observable<CustomForm> {
    return this.formsApi.formControllerPublishForm({ formId }).pipe(
      map(r => mapForm(r.responsePayload!)),
    );
  }

  disableForm(formId: string): Observable<CustomForm> {
    return this.formsApi.formControllerDisableForm({ formId }).pipe(
      map(r => mapForm(r.responsePayload!)),
    );
  }

  addField(formId: string, input: UpsertCustomFormFieldInput & { key: string }): Observable<CustomFormField> {
    return this.fieldsApi.formFieldControllerAddField({
      formId,
      body: toFieldBody(input, true) as AddFormFieldDto,
    }).pipe(map(r => mapField(r.responsePayload!)));
  }

  updateField(formId: string, fieldId: string, input: UpsertCustomFormFieldInput): Observable<CustomFormField> {
    return this.fieldsApi.formFieldControllerUpdateField({
      formId,
      fieldId,
      body: toFieldBody(input, false) as UpdateFormFieldDto,
    }).pipe(map(r => mapField(r.responsePayload!)));
  }

  disableField(formId: string, fieldId: string): Observable<CustomFormField> {
    return this.fieldsApi.formFieldControllerDisableField({ formId, fieldId }).pipe(
      map(r => mapField(r.responsePayload!)),
    );
  }

  reorderFields(formId: string, items: Array<{ id: string; sortOrder: number }>): Observable<CustomFormField[]> {
    return this.fieldsApi.formFieldControllerBulkUpdateSortOrder({
      formId,
      body: { items },
    }).pipe(map(r => (r.responsePayload ?? []).map(mapField)));
  }
}
