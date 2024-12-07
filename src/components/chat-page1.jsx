import { useState, useEffect } from "react";
import "./chat-page1.css";

const ChatPage = ({ friendsList, setFriendsList }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [websocket, setWebSocket] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [email, setEmail] = useState("");

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    // Start chat button logic
    const handleStartChat = async () => {
        if (!email.trim()) {
            alert("Please enter a valid email!");
            return;
        }

        try {
            // Fetch user by email
            const response = await fetch(`http://localhost:8000/get-user-by-email?email=${email}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const user = await response.json();
            if (user && user.id) {
                // Check if the user is already in the friends list
                const isAlreadyFriend = friendsList.some((friend) => friend.id === user.id);
                if (isAlreadyFriend) {
                    alert("User is already in your friends list!");
                } else {
                    // Add user to friends list
                    setFriendsList([...friendsList, user]);
                    alert(`${user.username} has been added to your friends list!`);
                }
            } else {
                // User not found
                alert("User not found. Please check the email and try again.");
            }
        } catch (error) {
            console.error("Error fetching user by email:", error);
            alert("An error occurred. Please try again later.");
        }

        // Clear the input field
        setEmail("");
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("http://localhost:8000/current-user");
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const data = await response.json();
            setCurrentId(data.user_id);
            setCurrentUser(data.username);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };



    const initializeWebSocket = () => {
        const ws = new WebSocket(`ws://44.215.29.97:8000/ws/${currentId}/${currentUser}`);

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const receivedMessage = event.data;
            setChatMessages((prevMessages) => [...prevMessages, receivedMessage]);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed. Reconnecting...');
            setTimeout(() => initializeWebSocket(), 5000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setWebSocket(ws);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Fetch the current user's ID and username, initialize websocket connection
    useEffect(() => {
        fetchCurrentUser();
        initializeWebSocket();
    }, []);

    return (
        <div className="chat-page">
            <div className="sidebar">
                <input
                    type="text"
                    placeholder="Enter Friend's Email"
                    onChange={handleEmailChange}
                    className="input-box"
                />
                <button onClick={handleStartChat} className="start-chat-button" id="start-chat">Start Chat</button>
                <h3>Friend List</h3>
                <div className="dropdown">
                    <div className="dropdown-header" onClick={toggleDropdown}>
                        Select Friend
                        <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
                    </div>
                    {isDropdownOpen && (
                        <ul className="dropdown-list">
                            {friendsList.map((friend) => (
                                <li key={friend.id}>{friend.username}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="chat-area">
                <div className="chat-header">
                    Chat With <span>{`{username}`}</span>
                </div>
                <div className="chat-box"></div>
                <div className="chat-input">
                    <input type="text" placeholder="Type a message"/>
                    <button className="send-button">Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
