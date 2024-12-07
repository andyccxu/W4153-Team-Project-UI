import { useState, useEffect } from "react";
import "./chat-page1.css";


const ChatPage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [websocket, setWebSocket] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("http://localhost:8000/get-user-id"); // Replace with your backend's URL
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const data = await response.json();
            setCurrentId(data.id);
            setCurrentUser(data.username);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };


    // Fetch the current user's ID and username
    useEffect(() => {
        fetchCurrentUser();
    }, []);


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

    return (
        <div className="container">
            <div className="sidebar">
                <input
                    type="text"
                    placeholder="Enter Friend's Email"
                    className="input-box"
                />
                <button className="start-chat-button" id="start-chat">Start Chat</button>
                <h3>Friend List</h3>
                <div className="dropdown">
                    <div className="dropdown-header" onClick={toggleDropdown}>
                        Select Friend
                        <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
                    </div>
                    {isDropdownOpen && (
                        <ul className="dropdown-list">
                            <li>David Xu</li>
                            <li>Charlotte</li>
                            <li>Tom</li>
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
