import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  takeUntil,
} from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import { AdminConsoleShellComponent } from '../../shared/admin-console-shell.component';
import { GROUP_LABELS, metaForNamespace } from '../config/namespace-catalog';
import { resolveJsonStorePermissions } from '../config/json-store.permissions';
import { provideJsonStoreDataSource } from '../data/json-store.providers';
import { JsonStoreDataSource } from '../data/json-store-data.source';
import type {
  AdminJsonDocument,
  DraftValidationState,
  EditorTab,
  JsonStorePermissions,
  JsonStoreSchemaCatalogItem,
  JsonStoreSchemaGroup,
  JsonStoreSchemaResolve,
  ValidationIssue,
} from '../domain';
import { extractErrorMessages, parseServerValidationMessage } from '../utils/map-server-issues';
import { stringifyPretty } from '../utils/parse-json';
import { skeletonFromJsonSchema, validateDraft } from '../utils/validate-draft';

interface NamespaceNode {
  namespace: string;
  label: string;
  group: JsonStoreSchemaGroup;
  count: number;
  hasSchema: boolean;
  managedLink?: string;
  consumerHint?: string;
}

@Component({
  selector: 'app-json-store-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminConsoleShellComponent],
  providers: [...provideJsonStoreDataSource()],
  templateUrl: './json-store-editor.component.html',
  styleUrls: ['./json-store-editor.component.scss'],
})
export class JsonStoreEditorComponent implements OnInit, OnDestroy {
  private readonly data = inject(JsonStoreDataSource);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly modal = inject(ModalService);
  private readonly destroy$ = new Subject<void>();
  private readonly draftChange$ = new Subject<string>();

  protected readonly groupLabels = GROUP_LABELS;
  protected readonly groups: JsonStoreSchemaGroup[] = ['reference', 'content', 'managed'];

  protected permissions: JsonStorePermissions = resolveJsonStorePermissions(this.authorization);
  protected loading = false;
  protected saving = false;
  protected catalog: JsonStoreSchemaCatalogItem[] = [];
  protected allDocs: AdminJsonDocument[] = [];
  protected namespaceNodes: NamespaceNode[] = [];
  protected namespaceFilter = '';
  protected keyFilter = '';

  protected selectedNamespace = '';
  protected selectedKey = '';
  protected selected: AdminJsonDocument | null = null;
  protected schemaResolve: JsonStoreSchemaResolve | null = null;

  protected draftText = '';
  protected savedText = '';
  protected validation: DraftValidationState = {
    parseOk: true,
    schemaOk: true,
    schemaIssues: [],
    canSave: false,
  };
  protected serverIssues: ValidationIssue[] = [];
  protected activeTab: EditorTab = 'json';
  protected showCreate = false;
  protected createNamespace = '';
  protected createKey = '';
  protected createMode: 'skeleton' | 'empty' = 'skeleton';
  protected treeExpanded = new Set<string>(['root']);

  protected get dirty(): boolean {
    return this.draftText !== this.savedText;
  }

  protected get docsInNamespace(): AdminJsonDocument[] {
    const q = this.keyFilter.trim().toLowerCase();
    return this.allDocs
      .filter(d => d.namespace === this.selectedNamespace)
      .filter(d => !q || d.key.toLowerCase().includes(q))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  protected get filteredNamespaceNodes(): NamespaceNode[] {
    const q = this.namespaceFilter.trim().toLowerCase();
    return this.namespaceNodes.filter(n =>
      !q || n.namespace.toLowerCase().includes(q) || n.label.toLowerCase().includes(q),
    );
  }

  protected nodesByGroup(group: JsonStoreSchemaGroup): NamespaceNode[] {
    return this.filteredNamespaceNodes.filter(n => n.group === group);
  }

  protected get managedMeta() {
    return metaForNamespace(this.selectedNamespace, this.catalog);
  }

  protected get gutterLines(): number[] {
    const count = Math.max(1, this.draftText.split(/\r?\n/).length);
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  protected get errorLineSet(): Set<number> {
    const lines = new Set<number>();
    if (this.validation.parseLine) lines.add(this.validation.parseLine);
    for (const issue of this.validation.schemaIssues) {
      if (issue.line) lines.add(issue.line);
    }
    for (const issue of this.serverIssues) {
      if (issue.line) lines.add(issue.line);
    }
    return lines;
  }

  protected get treeRoots(): TreeNode[] {
    try {
      const parsed = JSON.parse(this.draftText || '{}') as unknown;
      return [toTreeNode('root', parsed, '')];
    } catch {
      return [];
    }
  }

  ngOnInit(): void {
    this.permissions = resolveJsonStorePermissions(this.authorization);
    this.draftChange$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => this.revalidate());

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const ns = params.get('ns') ?? '';
      const key = params.get('key') ?? '';
      const action = params.get('action');
      if (action === 'create' && this.permissions.canCreate) {
        this.openCreate(ns || this.selectedNamespace);
      }
      void this.applyRouteSelection(ns, key);
    });

    this.reloadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty) {
      event.preventDefault();
      event.returnValue = true;
    }
  }

  protected reloadAll(): void {
    this.loading = true;
    forkJoin({
      docs: this.data.listAll().pipe(catchError(() => of([] as AdminJsonDocument[]))),
      schemas: this.data.listSchemas().pipe(catchError(() => of([] as JsonStoreSchemaCatalogItem[]))),
    }).subscribe(({ docs, schemas }) => {
      this.allDocs = docs;
      this.catalog = schemas;
      this.rebuildNamespaceNodes();
      this.loading = false;
      const ns = this.route.snapshot.queryParamMap.get('ns') ?? '';
      const key = this.route.snapshot.queryParamMap.get('key') ?? '';
      void this.applyRouteSelection(ns, key);
    });
  }

  protected selectNamespace(namespace: string): void {
    if (namespace === this.selectedNamespace) return;
    void this.guardUnsaved().then(ok => {
      if (!ok) return;
      this.selected = null;
      this.selectedKey = '';
      this.draftText = '';
      this.savedText = '';
      this.serverIssues = [];
      this.navigate(namespace, '');
    });
  }

  protected selectDocument(doc: AdminJsonDocument): void {
    if (doc.id === this.selected?.id) return;
    void this.guardUnsaved().then(ok => {
      if (!ok) return;
      this.navigate(doc.namespace, doc.key);
    });
  }

  protected onDraftInput(value: string): void {
    this.draftText = value;
    this.serverIssues = [];
    this.draftChange$.next(value);
  }

  protected setTab(tab: EditorTab): void {
    this.activeTab = tab;
  }

  protected formatDraft(): void {
    const state = validateDraft(this.draftText, this.savedText, this.schemaResolve?.jsonSchema ?? null);
    if (!state.parseOk || !state.parsed) {
      this.modal.openNotificationModal({
        title: 'Cannot format',
        description: state.parseError ?? 'Fix JSON syntax first.',
      }, 'notification', 'error');
      return;
    }
    const pretty = stringifyPretty(state.parsed);
    // Formatting alone should not mark dirty if content is equal after normalize.
    const savedNormalized = stringifyPretty(JSON.parse(this.savedText || '{}'));
    this.draftText = pretty;
    if (pretty === savedNormalized) {
      this.savedText = pretty;
    }
    this.revalidate();
  }

  protected revertDraft(): void {
    this.draftText = this.savedText;
    this.serverIssues = [];
    this.revalidate();
  }

  protected save(): void {
    if (!this.selected || !this.permissions.canUpdate) return;
    this.revalidate();
    if (!this.validation.canSave || !this.validation.parseOk) return;

    const state = validateDraft(this.draftText, this.savedText, this.schemaResolve?.jsonSchema ?? null);
    if (!state.parsed) return;

    this.saving = true;
    this.data.update(this.selected.id, state.parsed).subscribe({
      next: doc => {
        this.saving = false;
        this.applyDocument(doc);
        this.patchDocInList(doc);
        this.modal.openNotificationModal({
          title: 'Saved',
          description: `${doc.namespace} / ${doc.key}`,
        }, 'notification', 'success');
      },
      error: err => {
        this.saving = false;
        const msg = extractErrorMessages(err);
        this.serverIssues = parseServerValidationMessage(msg, this.draftText);
        notifyFeatureError(this.modal, err, {
          title: 'Save failed',
          description: msg,
        });
      },
    });
  }

  protected deleteSelected(): void {
    if (!this.selected || !this.permissions.canDelete) return;
    const doc = this.selected;
    const hint = this.managedMeta.consumerHint
      ? `\n\n${this.managedMeta.consumerHint}`
      : '';
    this.modal.openNotificationModal({
      title: 'Delete document?',
      description: `Delete "${doc.key}" from ${doc.namespace}? This cannot be undone.${hint}`,
    }, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.data.remove(doc.id).subscribe({
        next: () => {
          this.allDocs = this.allDocs.filter(d => d.id !== doc.id);
          this.rebuildNamespaceNodes();
          this.selected = null;
          this.draftText = '';
          this.savedText = '';
          this.navigate(doc.namespace, '');
          this.modal.openNotificationModal({
            title: 'Deleted',
            description: doc.key,
          }, 'notification', 'success');
        },
        error: err => {
          notifyFeatureError(this.modal, err, {
            title: 'Delete failed',
            description: extractErrorMessages(err),
          });
        },
      });
    });
  }

  protected openCreate(namespace = this.selectedNamespace): void {
    this.createNamespace = namespace || this.namespaceNodes[0]?.namespace || '';
    this.createKey = '';
    this.createMode = 'skeleton';
    this.showCreate = true;
  }

  protected closeCreate(): void {
    this.showCreate = false;
  }

  protected submitCreate(): void {
    const namespace = this.createNamespace.trim();
    const key = this.createKey.trim();
    if (!namespace || !key) {
      this.modal.openNotificationModal({
        title: 'Missing fields',
        description: 'Namespace and key are required.',
      }, 'notification', 'error');
      return;
    }

    const finish = (payload: Record<string, unknown>) => {
      this.data.create({ namespace, key, payload }).subscribe({
        next: doc => {
          this.showCreate = false;
          this.allDocs = [...this.allDocs, doc];
          this.rebuildNamespaceNodes();
          this.navigate(doc.namespace, doc.key);
          this.modal.openNotificationModal({
            title: 'Created',
            description: `${doc.namespace} / ${doc.key}`,
          }, 'notification', 'success');
        },
        error: err => {
          notifyFeatureError(this.modal, err, {
            title: 'Create failed',
            description: extractErrorMessages(err),
          });
        },
      });
    };

    if (this.createMode === 'empty') {
      finish({});
      return;
    }

    this.data.resolveSchema(namespace, key).pipe(
      catchError(() => of({
        namespace,
        key,
        match: 'none' as const,
        jsonSchema: null,
      })),
      map(schema => skeletonFromJsonSchema(schema.jsonSchema)),
    ).subscribe(payload => finish(payload));
  }

  protected toggleTree(path: string): void {
    if (this.treeExpanded.has(path)) this.treeExpanded.delete(path);
    else this.treeExpanded.add(path);
  }

  protected isTreeExpanded(path: string): boolean {
    return this.treeExpanded.has(path);
  }

  protected updateTreeLeaf(path: string, raw: string): void {
    try {
      const root = JSON.parse(this.draftText || '{}') as unknown;
      const segments = path.split('.').filter(Boolean);
      if (segments[0] === 'root') segments.shift();
      let cur: unknown = root;
      for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (cur && typeof cur === 'object') {
          cur = (cur as Record<string, unknown>)[seg];
        }
      }
      const last = segments[segments.length - 1];
      if (cur && typeof cur === 'object' && last !== undefined) {
        let value: unknown = raw;
        if (raw === 'true') value = true;
        else if (raw === 'false') value = false;
        else if (raw !== '' && !Number.isNaN(Number(raw)) && /^-?\d+(\.\d+)?$/.test(raw)) {
          value = Number(raw);
        }
        (cur as Record<string, unknown>)[last] = value;
        this.onDraftInput(stringifyPretty(root));
      }
    } catch {
      // ignore while JSON invalid
    }
  }

  protected trackByNs(_: number, n: NamespaceNode): string {
    return n.namespace;
  }

  protected trackByDoc(_: number, d: AdminJsonDocument): string {
    return d.id;
  }

  private rebuildNamespaceNodes(): void {
    const counts = new Map<string, number>();
    for (const doc of this.allDocs) {
      counts.set(doc.namespace, (counts.get(doc.namespace) ?? 0) + 1);
    }

    const namespaces = new Set<string>([
      ...counts.keys(),
      ...this.catalog.filter(c => !c.key).map(c => c.namespace),
      ...this.catalog.map(c => c.namespace),
    ]);

    this.namespaceNodes = [...namespaces]
      .map(namespace => {
        const meta = metaForNamespace(namespace, this.catalog);
        const hasSchema = this.catalog.some(
          c => c.namespace === namespace && c.hasSchema && !c.key,
        ) || this.catalog.some(c => c.namespace === namespace && c.hasSchema);
        return {
          namespace,
          label: meta.label,
          group: meta.group,
          count: counts.get(namespace) ?? 0,
          hasSchema,
          managedLink: meta.managedLink,
          consumerHint: meta.consumerHint,
        } satisfies NamespaceNode;
      })
      .sort((a, b) => a.namespace.localeCompare(b.namespace));
  }

  private async applyRouteSelection(ns: string, key: string): Promise<void> {
    if (!ns) {
      if (this.namespaceNodes.length && !this.selectedNamespace) {
        this.selectedNamespace = this.namespaceNodes[0].namespace;
      }
      return;
    }

    if (this.selectedNamespace === ns && this.selectedKey === key && this.selected) {
      return;
    }

    this.selectedNamespace = ns;
    this.selectedKey = key;

    if (!key) {
      this.selected = null;
      this.draftText = '';
      this.savedText = '';
      this.schemaResolve = null;
      return;
    }

    const fromList = this.allDocs.find(d => d.namespace === ns && d.key === key);
    const doc$ = fromList
      ? this.data.getById(fromList.id)
      : this.data.getByKey(ns, key);

    forkJoin({
      doc: doc$.pipe(catchError(() => of(undefined))),
      schema: this.data.resolveSchema(ns, key).pipe(catchError(() => of({
        namespace: ns,
        key,
        match: 'none' as const,
        jsonSchema: null,
      }))),
    }).subscribe(({ doc, schema }) => {
      this.schemaResolve = schema;
      if (doc) this.applyDocument(doc);
      else {
        this.selected = null;
        this.draftText = '';
        this.savedText = '';
      }
    });
  }

  private applyDocument(doc: AdminJsonDocument): void {
    this.selected = doc;
    this.selectedNamespace = doc.namespace;
    this.selectedKey = doc.key;
    const text = stringifyPretty(doc.payload);
    this.savedText = text;
    this.draftText = text;
    this.serverIssues = [];
    this.revalidate();
  }

  private patchDocInList(doc: AdminJsonDocument): void {
    const idx = this.allDocs.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      this.allDocs = [
        ...this.allDocs.slice(0, idx),
        doc,
        ...this.allDocs.slice(idx + 1),
      ];
    } else {
      this.allDocs = [...this.allDocs, doc];
    }
    this.rebuildNamespaceNodes();
  }

  private revalidate(): void {
    this.validation = validateDraft(
      this.draftText,
      this.savedText,
      this.schemaResolve?.jsonSchema ?? null,
    );
  }

  private navigate(ns: string, key: string): void {
    void this.router.navigate([AppRoute.secured_admin_json_store_page.url], {
      queryParams: {
        ns: ns || null,
        key: key || null,
      },
      queryParamsHandling: '',
    });
  }

  private async guardUnsaved(): Promise<boolean> {
    if (!this.dirty) return true;
    return new Promise(resolve => {
      const modal = this.modal.openNotificationModal({
        title: 'Discard unsaved changes?',
        description: `${this.selectedNamespace} / ${this.selectedKey} has unsaved changes.`,
      }, 'confirmation', 'warning');
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      modal.onAccept$.subscribe(() => finish(true));
      modal.onDecline$.subscribe(() => finish(false));
    });
  }
}

interface TreeNode {
  path: string;
  name: string;
  value: unknown;
  kind: 'object' | 'array' | 'leaf';
  children: TreeNode[];
}

function toTreeNode(name: string, value: unknown, parentPath: string): TreeNode {
  const path = parentPath ? `${parentPath}.${name}` : name;
  if (value !== null && typeof value === 'object') {
    if (Array.isArray(value)) {
      return {
        path,
        name,
        value,
        kind: 'array',
        children: value.map((v, i) => toTreeNode(String(i), v, path)),
      };
    }
    return {
      path,
      name,
      value,
      kind: 'object',
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) =>
        toTreeNode(k, v, path),
      ),
    };
  }
  return { path, name, value, kind: 'leaf', children: [] };
}
