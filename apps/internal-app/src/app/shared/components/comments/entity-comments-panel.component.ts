import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CommentContentComponent,
  MentionCommentEditorComponent,
  MENTION_USER_SEARCH,
  type MentionUserSearchFn,
} from '@nabarun-ngo/comment-angular';
import type { CommentEditorValue, MentionCandidate } from '@nabarun-ngo/comment-core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { CommentResponseDto } from 'src/app/core/api/api-client/models/comment-response-dto';
import { CreateCommentDto } from 'src/app/core/api/api-client/models/create-comment-dto';
import { CommentsService } from 'src/app/core/api/api-client/services/comments.service';
import { UsersService } from 'src/app/core/api/api-client/services/users.service';
import { IUserIdentityService } from 'src/app/core/auth/tokens/user-identity.token';
import { ModalService } from 'src/app/core/shell/service/modal.service';

function createMentionUserSearch(usersApi: UsersService): MentionUserSearchFn {
  let activeUsers: Promise<MentionCandidate[]> | undefined;

  return async query => {
    activeUsers ??= firstValueFrom(usersApi.userControllerListUsers({
      pageIndex: 0,
      pageSize: 100,
      status: 'ACTIVE',
      sortBy: 'firstName',
      sortDir: 'asc',
    })).then(response => (response.responsePayload?.items ?? []).map(user => ({
      userId: user.id,
      displayName: user.fullName?.trim() || user.email,
      email: user.email,
    }))).catch(() => []);

    const normalized = query.trim().toLocaleLowerCase();
    const users = await activeUsers;
    return users
      .filter(user => !normalized
        || user.displayName.toLocaleLowerCase().includes(normalized)
        || user.email.toLocaleLowerCase().includes(normalized))
      .slice(0, 10);
  };
}

/**
 * Interactive comments panel for list-dashboard detail sheets.
 * Uses CommentsService with an entityType / entityId pair (e.g. PROJECT, ACTIVITY).
 */
@Component({
  selector: 'app-entity-comments-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MentionCommentEditorComponent,
    CommentContentComponent,
    DatePipe,
  ],
  providers: [
    {
      provide: MENTION_USER_SEARCH,
      useFactory: createMentionUserSearch,
      deps: [UsersService],
    },
  ],
  templateUrl: './entity-comments-panel.component.html',
  styleUrls: ['./entity-comments-panel.component.scss'],
})
export class EntityCommentsPanelComponent implements OnChanges, OnDestroy, OnInit {
  @Input({ required: true }) entityType!: string;
  @Input({ required: true }) entityId!: string;
  @Input() title = 'Comments';
  @Input() maxHeight = '360px';

  @ViewChild('commentsScrollArea') commentsScrollArea?: ElementRef<HTMLElement>;

  comments: CommentResponseDto[] = [];
  newCommentEditor: CommentEditorValue = { content: '', mentions: [] };
  replyingTo: CommentResponseDto | null = null;
  replyEditor: CommentEditorValue = { content: '', mentions: [] };
  editingCommentId: string | null = null;
  editingEditor: CommentEditorValue = { content: '', mentions: [] };
  loading = false;
  currentUserId = '';

  private readonly destroy$ = new Subject<void>();
  private loadGeneration = 0;

  constructor(
    private readonly commentsApi: CommentsService,
    private readonly modalService: ModalService,
    @Inject(IUserIdentityService) private readonly userIdentityService: IUserIdentityService,
  ) {}

  ngOnInit(): void {
    void this.userIdentityService.getId().then(id => {
      this.currentUserId = id ?? '';
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (('entityId' in changes || 'entityType' in changes) && this.entityId && this.entityType) {
      this.resetEditors();
      this.fetchComments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchComments(): void {
    if (!this.entityId || !this.entityType) {
      return;
    }
    const generation = ++this.loadGeneration;
    this.loading = true;
    this.commentsApi.commentControllerGetComments({
      entityType: this.entityType,
      entityId: this.entityId,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (generation !== this.loadGeneration) {
          return;
        }
        this.comments = response.responsePayload?.comments ?? [];
        this.loading = false;
      },
      error: () => {
        if (generation !== this.loadGeneration) {
          return;
        }
        this.comments = [];
        this.loading = false;
      },
    });
  }

  addComment(parentId?: string): void {
    const editor = parentId ? this.replyEditor : this.newCommentEditor;
    const content = editor.content?.trim();
    if (!content || !this.entityId || !this.entityType) {
      return;
    }

    const dto: CreateCommentDto = {
      content,
      entityId: this.entityId,
      entityType: this.entityType,
      parentId,
      mentions: editor.mentions ?? [],
    };

    this.commentsApi.commentControllerAddComment({ body: dto }).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (!response.responsePayload) {
          return;
        }
        if (!parentId) {
          this.comments = [...this.comments, response.responsePayload];
          this.newCommentEditor = { content: '', mentions: [] };
          queueMicrotask(() => this.scrollToBottom());
        } else {
          this.fetchComments();
          this.cancelReply();
        }
      },
    });
  }

  setReply(comment: CommentResponseDto): void {
    this.replyingTo = comment;
    this.replyEditor = { content: '', mentions: [] };
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyEditor = { content: '', mentions: [] };
  }

  startEdit(comment: CommentResponseDto): void {
    this.editingCommentId = comment.id;
    this.editingEditor = {
      content: comment.content,
      mentions: (comment.mentions ?? []).map(mention => ({
        userId: mention.userId,
        displayName: mention.displayName,
        email: '',
      })),
    };
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editingEditor = { content: '', mentions: [] };
  }

  updateComment(): void {
    const content = this.editingEditor.content?.trim();
    if (!this.editingCommentId || !content) {
      return;
    }

    this.commentsApi.commentControllerUpdateComment({
      id: this.editingCommentId,
      body: { content, mentions: this.editingEditor.mentions ?? [] },
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.fetchComments();
        this.cancelEdit();
      },
    });
  }

  deleteComment(commentId: string): void {
    const modal = this.modalService.openNotificationModal({
      title: 'Delete comment',
      description: 'Are you sure you want to delete this comment? This cannot be undone.',
    }, 'confirmation', 'warning');

    modal.onAccept$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.commentsApi.commentControllerDeleteComment({ id: commentId })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.fetchComments(),
        });
    });
  }

  isOwnComment(comment: CommentResponseDto): boolean {
    return !!this.currentUserId && comment.authorId === this.currentUserId;
  }

  trackByCommentId(_index: number, comment: CommentResponseDto): string {
    return comment.id;
  }

  private scrollToBottom(): void {
    const el = this.commentsScrollArea?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  private resetEditors(): void {
    this.newCommentEditor = { content: '', mentions: [] };
    this.replyEditor = { content: '', mentions: [] };
    this.editingEditor = { content: '', mentions: [] };
    this.replyingTo = null;
    this.editingCommentId = null;
  }
}
