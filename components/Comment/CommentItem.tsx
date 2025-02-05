'use client';

import { useState, useEffect } from 'react';
import { Comment, CommentType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { CommentEditor } from './CommentEditor';
import { convertDeltaToHTML } from '@/lib/convertDeltaToHTML';
import { Coins, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';

interface CommentItemProps {
  comment: Comment;
  contentType: ContentType;
  commentType: CommentType;
  onCommentUpdate: (newComment: Comment, parentId?: number) => void;
  onCommentDelete: (commentId: number) => void;
}

export const CommentItem = ({
  comment,
  contentType,
  commentType,
  onCommentUpdate,
  onCommentDelete,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    // Find all pre code blocks and apply highlighting
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [comment.content]);

  const handleReplySubmit = async (content: string) => {
    const newComment = await CommentService.createComment({
      workId: comment.thread.objectId,
      contentType,
      content,
      contentFormat: 'HTML',
      parentId: comment.id,
      commentType,
      threadType: commentType,
    });
    setIsReplying(false);
    onCommentUpdate(newComment, comment.id);
  };

  const handleEditSubmit = async (content: string) => {
    console.log('Starting edit submit for comment:', comment.id);
    setUpdateError(null);
    try {
      const updatedComment = await CommentService.updateComment({
        commentId: comment.id,
        documentId: comment.thread.objectId,
        contentType,
        content,
        contentFormat: 'HTML',
      });
      console.log('Received API response:', updatedComment);
      setIsEditing(false);
      console.log('Calling onCommentUpdate with:', updatedComment);
      onCommentUpdate(updatedComment, updatedComment.parentId || undefined);
    } catch (error) {
      console.error('Failed to update comment:', error);
      setUpdateError('Failed to update comment. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await CommentService.deleteComment({
          commentId: comment.id,
          documentId: comment.thread.objectId,
          contentType,
        });
        onCommentDelete(comment.id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <style jsx global>{`
        /* Comment Content Styles */
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .prose blockquote p {
          margin: 0;
        }

        .prose blockquote blockquote {
          border-left-color: #d1d5db;
          margin-left: 0.5rem;
        }

        /* List styles */
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose li {
          margin: 0.5rem 0;
        }

        .prose li > ul,
        .prose li > ol {
          margin: 0.5rem 0;
        }

        /* Code block styles */
        .prose pre {
          background-color: rgb(40, 44, 52);
          color: rgb(171, 178, 191);
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .prose pre code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
            'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          background: none;
          padding: 0;
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }

        /* Import highlight.js theme */
        @import 'highlight.js/styles/atom-one-dark.css';
      `}</style>

      {/* Author Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img
            src={comment.author.profileImage || '/default-avatar.png'}
            alt={comment.author.fullName}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <a href={comment.author.profileUrl} className="font-medium hover:text-indigo-600">
              {comment.author.fullName}
            </a>
            <div className="text-sm text-gray-500">
              {new Date(comment.createdDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-indigo-600"
            title="Edit comment"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600"
            title="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bounties */}
      {comment.bounties.length > 0 && (
        <div className="mb-4">
          {comment.bounties.map((bounty) => (
            <div
              key={bounty.id}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">
                  {parseFloat(bounty.amount).toFixed(0)} RSC Bounty
                </span>
                <span className="text-orange-700 text-sm">
                  · Expires {new Date(bounty.expirationDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Content */}
      {isEditing ? (
        <>
          {updateError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-2">{updateError}</div>
          )}
          <CommentEditor
            onSubmit={handleEditSubmit}
            initialContent={comment.content}
            onCancel={() => {
              setIsEditing(false);
              setUpdateError(null);
            }}
          />
        </>
      ) : comment.contentFormat === 'QUILL' ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: convertDeltaToHTML(
              typeof comment.content === 'string' ? { ops: [] } : comment.content
            ),
          }}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: comment.content as string }}
        />
      )}

      {/* Comment Metadata */}
      <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">ID: {comment.id}</span>
        <span>Score: {comment.score}</span>
        {comment.replyCount > 0 && (
          <span>
            · {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
          </span>
        )}
        {comment.isAcceptedAnswer && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Accepted Answer
          </span>
        )}
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Reply
        </button>
      </div>

      {/* Reply Editor */}
      {isReplying && (
        <div className="mt-4 ml-8">
          <CommentEditor
            onSubmit={handleReplySubmit}
            placeholder="Write a reply..."
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              contentType={contentType}
              commentType={commentType}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
