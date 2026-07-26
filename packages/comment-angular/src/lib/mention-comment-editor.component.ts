import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import type { CommentEditorValue, MentionCandidate } from '@nabarun-ngo/comment-core';
import {
  buildCommentEditorValue,
  contentToEditableText,
  deduplicateMentions,
  getActiveMentionQuery,
  insertMentionInEditableText,
} from '@nabarun-ngo/comment-core';
import { CommentContentComponent } from './comment-content.component';
import { MENTION_USER_SEARCH, type MentionUserSearchFn } from './tokens';

@Component({
  selector: 'cm-mention-comment-editor',
  standalone: true,
  imports: [FormsModule, CommentContentComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MentionCommentEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cm-mention-editor">
      <textarea
        #textarea
        [rows]="rows"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [(ngModel)]="editableText"
        (ngModelChange)="onEditableChange($event)"
        (click)="syncCursor()"
        (keyup)="syncCursor()"
        (keydown)="onKeyDown($event)"
      ></textarea>

      @if (mentionOpen) {
        <ul class="cm-mention-list" role="listbox">
          @if (loading) {
            <li>Searching…</li>
          } @else if (candidates.length === 0) {
            <li>No people found</li>
          } @else {
            @for (candidate of candidates; track candidate.userId; let i = $index) {
              <li
                role="option"
                [class.active]="i === activeIndex"
                (mousedown)="pickCandidate(candidate, $event)"
              >
                {{ candidate.displayName }}
                @if (candidate.email) {
                  <span>{{ candidate.email }}</span>
                }
              </li>
            }
          }
        </ul>
      }

      @if (showPreview && value) {
        <cm-comment-content [content]="value.content" [mentions]="value.mentions" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentionCommentEditorComponent implements ControlValueAccessor {
  @Input() rows = 4;
  @Input() placeholder = 'Write a comment… Use @ to mention someone';
  @Input() minMentionQueryLength = 1;
  @Input() showPreview = false;
  @Input() debounceMs = 200;
  @Input() searchUsers?: MentionUserSearchFn;

  @ViewChild('textarea') textareaRef?: ElementRef<HTMLTextAreaElement>;

  value: CommentEditorValue = { content: '', mentions: [] };
  editableText = '';
  disabled = false;

  mentionOpen = false;
  loading = false;
  candidates: MentionCandidate[] = [];
  activeIndex = 0;
  private cursor = 0;
  private mentionList: MentionCandidate[] = [];
  private searchTimer?: ReturnType<typeof setTimeout>;
  private requestId = 0;

  private onChange: (value: CommentEditorValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Inject(MENTION_USER_SEARCH) private readonly injectedSearch?: MentionUserSearchFn,
  ) {}

  private resolveSearch(): MentionUserSearchFn | undefined {
    return this.searchUsers ?? this.injectedSearch;
  }

  writeValue(value: CommentEditorValue | null): void {
    this.value = value ?? { content: '', mentions: [] };
    this.mentionList = [...this.value.mentions];
    this.editableText = contentToEditableText(this.value.content, this.value.mentions);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: CommentEditorValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onEditableChange(nextEditable: string): void {
    this.editableText = nextEditable;
    this.value = buildCommentEditorValue(nextEditable, this.mentionList);
    this.mentionList = [...this.value.mentions];
    this.onChange(this.value);
    this.scheduleSearch();
    this.cdr.markForCheck();
  }

  syncCursor(): void {
    const el = this.textareaRef?.nativeElement;
    this.cursor = el?.selectionStart ?? this.editableText.length;
    this.scheduleSearch();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.mentionOpen || this.candidates.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.candidates.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex =
        (this.activeIndex - 1 + this.candidates.length) % this.candidates.length;
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const candidate = this.candidates[this.activeIndex];
      if (candidate) {
        this.applyCandidate(candidate);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.candidates = [];
      this.mentionOpen = false;
    }
  }

  pickCandidate(candidate: MentionCandidate, event: MouseEvent): void {
    event.preventDefault();
    this.applyCandidate(candidate);
  }

  private applyCandidate(candidate: MentionCandidate): void {
    const result = insertMentionInEditableText(this.editableText, this.cursor, candidate);
    this.mentionList = deduplicateMentions([
      ...this.mentionList.filter((m) => m.userId !== candidate.userId),
      candidate,
    ]);
    this.editableText = result.text;
    this.cursor = result.cursor;
    this.value = buildCommentEditorValue(this.editableText, this.mentionList);
    this.onChange(this.value);
    this.candidates = [];
    this.mentionOpen = false;

    queueMicrotask(() => {
      const el = this.textareaRef?.nativeElement;
      if (!el) return;
      el.focus();
      el.setSelectionRange(this.cursor, this.cursor);
    });

    this.cdr.markForCheck();
  }

  private scheduleSearch(): void {
    const searchUsers = this.resolveSearch();
    if (!searchUsers) {
      this.mentionOpen = false;
      return;
    }

    const query = getActiveMentionQuery(this.editableText, this.cursor);
    if (query === null || query.length < this.minMentionQueryLength) {
      this.mentionOpen = query !== null;
      this.candidates = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.mentionOpen = true;
    this.loading = true;
    const requestId = ++this.requestId;

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      void Promise.resolve(searchUsers(query))
        .then((results) => {
          if (requestId !== this.requestId) return;
          this.candidates = results;
          this.activeIndex = 0;
        })
        .finally(() => {
          if (requestId === this.requestId) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
    }, this.debounceMs);
  }
}
