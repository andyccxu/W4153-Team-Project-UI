import PropTypes from 'prop-types';

const PostCard = ({ post }) => (
    <div className="card mb-4">
        <div className="card-body">
            <h2 className="card-title">{post.title}</h2>
            <p className="card-text">{post.content}</p>

            <h3 className="mt-1">Comments</h3>
            {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                    <div key={comment.id} className="card mb-3">
                        <div className="card-body">
                            <p className="card-text">
                                <strong>{comment.writer_uni}:</strong>{' '}
                                {comment.content}
                                <span className="text-danger ms-3">
                                    ❤️ {comment.likes}
                                </span>
                            </p>

                            <h4 className="mt-3">Replies</h4>
                            {comment.replies.length > 0 ? (
                                comment.replies.map((reply) => (
                                    <div key={reply.id} className="ms-4 mb-2">
                                        <p>
                                            <strong>{reply.writer_uni}:</strong>{' '}
                                            {reply.content}
                                            <span className="text-danger ms-3">
                                                ❤️ {reply.likes}
                                            </span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="ms-4 text-muted">No replies</p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted">No comments yet</p>
            )}
        </div>
    </div>
);

PostCard.propTypes = {
    post: PropTypes.shape({
        pid: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        comments: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                post_id: PropTypes.number.isRequired,
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