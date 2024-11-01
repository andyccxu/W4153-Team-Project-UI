// PostCard.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PostCard = ({ post }) => {
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleCommentChange = (e) => setNewComment(e.target.value);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        console.log(newComment);
        // todo: onSubmitComment
        // onSubmitComment(post.pid, newComment);
        setNewComment('');
    };

    const toggleCommentsVisibility = () => {
        setCommentsVisible(!commentsVisible);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h2 className="card-title">{post.title}</h2>
                <p className="card-text">{post.content}</p>

                {/* Toggle Comments Button */}
                <button
                    onClick={toggleCommentsVisibility}
                    className="btn btn-link text-primary p-0"
                >
                    {commentsVisible ? 'Hide Comments' : 'Show Comments'} (
                    {post.comments.length})
                </button>

                {/* Comments Section */}
                {commentsVisible && (
                    <div className="mt-3">
                        <h3>Comments</h3>
                        {post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="card mb-3">
                                    <div className="card-body">
                                        <p className="card-text">
                                            <strong>
                                                {comment.writer_uni}:
                                            </strong>{' '}
                                            {comment.content}
                                            <span className="text-danger ms-3">
                                                ❤️ {comment.likes}
                                            </span>
                                        </p>

                                        {/* Replies */}
                                        {comment.replies.length > 0 ? (
                                            <div className="ms-4">
                                                <h4>Replies</h4>
                                                {comment.replies.map(
                                                    (reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="mb-2"
                                                        >
                                                            <p>
                                                                <strong>
                                                                    {
                                                                        reply.writer_uni
                                                                    }
                                                                    :
                                                                </strong>{' '}
                                                                {reply.content}
                                                                <span className="text-danger ms-3">
                                                                    ❤️{' '}
                                                                    {
                                                                        reply.likes
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="ms-4 text-muted">
                                                No replies
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No comments yet</p>
                        )}

                        {/* New Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mt-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={handleCommentChange}
                                placeholder="Add a comment..."
                                className="form-control mb-2"
                                required
                            />
                            <button type="submit" className="btn btn-secondary">
                                Submit Comment
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

PostCard.propTypes = {
    post: PropTypes.shape({
        pid: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        comments: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                content: PropTypes.string.isRequired,
                writer_uni: PropTypes.string.isRequired,
                likes: PropTypes.number.isRequired,
                replies: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.number.isRequired,
                        content: PropTypes.string.isRequired,
                        writer_uni: PropTypes.string.isRequired,
                        likes: PropTypes.number.isRequired
                    })
                ).isRequired
            })
        ).isRequired
    }).isRequired
};

export default PostCard;
