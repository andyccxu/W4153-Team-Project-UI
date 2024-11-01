import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostCard from './post-card';

const MainFeed = ({ posts }) => {
    return (
        <div className="container my-4 pt-5">
            <h1 className="mb-4">User Posts</h1>
            {posts.items.map((post) => (
                <PostCard key={post.pid} post={post} />
            ))}
        </div>
    );
};

const MainFeedPage = () => {
    const [posts, setPosts] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(
                    `${
                        import.meta.env.VITE_MAINFEED_SERVICE_BASE_URL
                    }/main_feed`
                );
                const data = await response.json();
                if (!data.items) {
                    throw new Error(data.message || 'Failed to fetch posts');
                }
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return <div>{posts ? <MainFeed posts={posts} /> : <p>Loading...</p>}</div>;
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
