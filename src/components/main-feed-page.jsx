import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostCard from './post-card';

const MainFeed = ({ posts }) => {
    return (
        <div className="container my-4 pt-3">
            <h1 className="mb-4">User Posts</h1>
            {posts.items.map((post) => (
                <PostCard key={post.pid} post={post} />
            ))}
        </div>
    );
};

const NewPostForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const securityToken = localStorage.getItem('security_token');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_GW_BASE_URL}/user_post`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Security-Token': securityToken
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create post');
            }

            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="new-post-form mt-5 bg-success bg-opacity-10 rounded"
        >
            <div className="mb-3 px-3" style={{ paddingTop: '20px' }}>
                <label htmlFor="title" className="form-label">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3 px-3">
                <label htmlFor="content" className="form-label">
                    Content
                </label>
                <textarea
                    id="content"
                    className="form-control"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                ></textarea>
            </div>
            <div className="mb-3 px-3">
                <label htmlFor="image" className="form-label">
                    Image (optional)
                </label>
                <input
                    type="file"
                    id="image"
                    className="form-control"
                    accept="image/png, image/jpeg"
                    onChange={(e) => setImage(e.target.files[0])}
                />
            </div>
            <button type="submit" className="btn btn-primary ms-3 mb-3">
                Publish New Post
            </button>
        </form>
    );
};

const MainFeedPage = () => {
    const [posts, setPosts] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPosts = async (page = 1) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_GW_BASE_URL}/main_feed?page=${page}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'X-Security-Token':
                            localStorage.getItem('security_token')
                    }
                }
            );

            const data = await response.json();
            if (!data.items) {
                throw new Error(data.message || 'Failed to fetch posts');
            }

            setPosts(data);
            setCurrentPage(data.page);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching posts:', error);
            alert('Error fetching posts. Please try again later.');
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container">
            <NewPostForm />
            {posts ? (
                <div>
                    <MainFeed posts={posts} />
                    <div className="pagination">
                        <button
                            className="btn btn-light"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="page-number px-3">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-light"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
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
                comments: PropTypes.array.isRequired
            })
        ).isRequired
    }).isRequired
};

export default MainFeedPage;
