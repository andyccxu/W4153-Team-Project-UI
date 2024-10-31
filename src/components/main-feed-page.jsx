import {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from "prop-types";


const MainFeed = ({ posts }) => {
    return (
        <div className="container my-4 pt-5">
            <h1 className="mb-4">User Posts</h1>
            {posts.items.map(post => (
                <div key={post.pid} className="card mb-4">
                    <div className="card-body">
                        <h2 className="card-title">{post.title}</h2>
                        <p className="card-text">{post.content}</p>

                        <h3 className="mt-1">Comments</h3>
                        {post.comments.length > 0 ? (
                            post.comments.map(comment => (
                                <div key={comment.id} className="card mb-3">
                                    <div className="card-body">
                                        <p className="card-text">
                                            <strong>{comment.writer_uni}:</strong> {comment.content}
                                            <span className="text-danger ms-3">❤️ {comment.likes}</span>
                                        </p>

                                        <h4 className="mt-3">Replies</h4>
                                        {comment.replies.length > 0 ? (
                                            comment.replies.map(reply => (
                                                <div key={reply.id} className="ms-4 mb-2">
                                                    <p>
                                                        <strong>{reply.writer_uni}:</strong> {reply.content}
                                                        <span className="text-danger ms-3">❤️ {reply.likes}</span>
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
            ))}
        </div>
    );
};


const MainFeedPage = () => {
    const [posts, setPosts] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${ import.meta.env.VITE_MAINFEED_SERVICE_BASE_URL}/main_feed`);
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div>
            {posts ? <MainFeed posts={posts} /> : <p>Loading...</p>}
        </div>
    );
};

// Define the expected prop types
MainFeed.propTypes = {
    posts: PropTypes.shape({
        items: PropTypes.arrayOf(
            PropTypes.shape({
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
                                likes: PropTypes.number.isRequired,
                            })
                        ).isRequired,
                    })
                ).isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default MainFeedPage;
