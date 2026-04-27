import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { CommentsService } from 'src/app/core/api-client/services/comments.service';
import { CommentResponseDto } from 'src/app/core/api-client/models/comment-response-dto';
import { CreateCommentDto } from 'src/app/core/api-client/models/create-comment-dto';
import { Subject, takeUntil } from 'rxjs';
import { ModalService } from 'src/app/core/service/modal.service';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnDestroy {
  @Input() view!: DetailedView;
  @ViewChild('commentsScrollArea') commentsScrollArea!: ElementRef;

  comments: CommentResponseDto[] = [];
  newCommentContent: string = '';
  replyingTo: CommentResponseDto | null = null;
  replyContent: string = '';
  editingCommentId: string | null = null;
  editingContent: string = '';
  loading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private commentsService: CommentsService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    if (this.view.comments?.onOpen) {
      this.view.comments.onOpen.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.fetchComments();
      });
    } else {
      // Fallback: If no event is provided, fetch immediately (though the requirement was event-driven)
      this.fetchComments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchComments(): void {
    if (!this.view.comments) return;
    this.loading = true;
    this.commentsService.getComments({
      entityType: this.view.comments.entityType,
      entityId: this.view.comments.entityId
    }).subscribe({
      next: (response) => {
        this.comments = response.responsePayload || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
        this.loading = false;
      }
    });
  }

  addComment(parentId?: string): void {
    const content = parentId ? this.replyContent : this.newCommentContent;
    if (!content.trim() || !this.view.comments) return;

    const dto: CreateCommentDto = {
      content: content,
      entityId: this.view.comments.entityId,
      entityType: this.view.comments.entityType,
      parentId: parentId
    };

    this.commentsService.addComment({ body: dto }).subscribe({
      next: (response) => {
        if (response.responsePayload) {
          if (!parentId) {
            this.comments.push(response.responsePayload);
            this.newCommentContent = '';
            this.scrollToBottom();
          } else {
            this.fetchComments(); // Refresh to show the new reply in the nested structure
            this.cancelReply();
          }
        }
      },
      error: (err) => {
        console.error('Error adding comment:', err);
      }
    });
  }
  scrollToBottom() {
    console.log('scrolling to bottom', this.commentsScrollArea);
    if (this.commentsScrollArea) {
      const el = this.commentsScrollArea.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  setReply(comment: CommentResponseDto): void {
    this.replyingTo = comment;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  deleteComment(commentId: string): void {
    const modal = this.modalService.openNotificationModal({
      title: 'Delete Comment',
      description: 'Are you sure you want to delete this comment? This action cannot be undone.'
    }, 'confirmation', 'warning');

    modal.onAccept$.subscribe(() => {
      this.commentsService.deleteComment({ id: commentId }).subscribe({
        next: () => {
          this.fetchComments();
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
        }
      });
    });
  }

  startEdit(comment: CommentResponseDto): void {
    this.editingCommentId = comment.id;
    this.editingContent = comment.content;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  updateComment(): void {
    if (!this.editingCommentId || !this.editingContent.trim()) return;

    this.commentsService.updateComment({
      id: this.editingCommentId,
      body: { content: this.editingContent }
    }).subscribe({
      next: (response) => {
        if (response.responsePayload) {
          this.fetchComments();
          this.cancelEdit();
        }
      },
      error: (err) => {
        console.error('Error updating comment:', err);
      }
    });
  }

  trackByCommentId(index: number, comment: CommentResponseDto): string {
    return comment.id;
  }
}
