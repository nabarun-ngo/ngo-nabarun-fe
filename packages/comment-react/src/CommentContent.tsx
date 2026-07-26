import type { CommentMentionSummary } from '@nabarun-ngo/comment-core';
import { parseContentSegments } from '@nabarun-ngo/comment-core';

export interface CommentContentClassNames {
  root?: string;
  mention?: string;
}

export interface CommentContentProps {
  content: string;
  mentions?: CommentMentionSummary[];
  classNames?: CommentContentClassNames;
}

export function CommentContent({ content, mentions = [], classNames }: CommentContentProps) {
  const segments = parseContentSegments(content, mentions);

  return (
    <span className={classNames?.root}>
      {segments.map((segment, index) =>
        segment.type === 'mention' ? (
          <strong key={index} className={classNames?.mention} data-mention-id={segment.userId}>
            {segment.text}
          </strong>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
