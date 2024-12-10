import { useState, useEffect, useRef } from "react";
import "./chat-page.css";
import PropTypes from "prop-types";

const ChatPage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [message, setMessage] = useState(""); // Current message input
    const websocketRef = useRef(null); // WebSocket reference
    const [email, setEmail] = useState("");
    const [recipient, setRecipient] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [currentId, setCurrentId] = useState(null); // State for current user ID
    const [currentUsername, setCurrentUsername] = useState(null); // State for current username
    const [loading, setLoading] = useState(true);
    // const currentId = 12;
    // const currentUser = "yw_test";

    useEffect(() => {
        const storedUser = localStorage.getItem("user"); // Fetch the 'user' key from local storage

        if (!storedUser) {
            alert("Please log in to continue.");
            window.location.href = "/login"; // Redirect to login if no user is found
            return;
        }

        try {
            const currentUser = JSON.parse(storedUser); // Parse the JSON string
            setCurrentId(currentUser.id); // Store user ID in state
            setCurrentUsername(currentUser.username); // Store username in state

            console.log("Current user:", currentUser.username);
            console.log("Current user ID:", currentUser.id);
            setLoading(false);
        } catch (error) {
            console.error("Failed to parse user from local storage:", error);
            alert("Invalid user data. Please log in again.");
            window.location.href = "/login"; // Redirect to login if parsing fails
        }
    }, []);

    // Send user data to backend after setting `currentId` and `currentUsername`
    useEffect(() => {
        const storedUser = localStorage.getItem("user"); // Fetch the 'user' key from local storage

        if (!storedUser) {
            alert("Please log in to continue.");
            window.location.href = "/login"; // Redirect to login if no user is found
            return;
        }

        const sendUserToBackendAndFetchId = async (user) => {
            try {
                // Send user to the backend
                const response = await fetch("https://44.215.29.97:8000/auth/google-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`Error: ${errorDetails.detail}`);
                }

                console.log("User added to backend successfully.");

                // Fetch the user's ID using email
                const idResponse = await fetch(
                    `https://44.215.29.97:8000/get-user-email?email=${encodeURIComponent(user.email)}`
                );

                if (!idResponse.ok) {
                    const errorDetails = await idResponse.json();
                    throw new Error(`Error: ${errorDetails.detail}`);
                }

                const { user: fetchedUser } = await idResponse.json(); // Destructure the response
                console.log("Fetched user with ID:", fetchedUser);

                // Set the ID and username in state
                setCurrentId(fetchedUser.id);
                setCurrentUsername(fetchedUser.username);
            } catch (error) {
                console.error("Error during user setup:", error);
                alert("Failed to set up the user. Please try again.");
            } finally {
                setLoading(false); // Stop loading
            }
        };

        try {
            const currentUser = JSON.parse(storedUser); // Parse the JSON string
            const userPayload = {
                email: currentUser.email,
                username: currentUser.username,
            };

            sendUserToBackendAndFetchId(userPayload); // Add user and fetch ID
        } catch (error) {
            console.error("Failed to parse user from local storage:", error);
            alert("Invalid user data. Please log in again.");
            window.location.href = "/login"; // Redirect to login if parsing fails
        }
    }, []);

    // Fetch friends list on component mount
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await fetch(`https://44.215.29.97:8000/friend-list/${currentId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch friend list");
                }

                const { friends } = await response.json();
                // Normalize friend list structure
                const normalizedFriends = friends.map((friend) => ({
                    id: friend.friend_id, // Map friend_id to id
                    username: friend.username,
                    email: friend.email,
                }));
                setFriendsList(normalizedFriends); // Initialize the friend list
                console.log("Fetched friend list:", friends);
            } catch (error) {
                console.error("Error fetching friend list:", error);
                //alert("Failed to load friend list. Please try again later.");
            }
        };

        fetchFriends();
    }, [currentId]);


    // Establish WebSocket connection
    useEffect(() => {
        const ws = new WebSocket(`wss://44.215.29.97:8000/ws/${currentId}`);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
            const receivedMessage = event.data;
            setChatMessages((prevMessages) => [...prevMessages, receivedMessage]);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close(); // Cleanup WebSocket on component unmount
        };
    }, [currentId]);


    // Handle sending a message
    const handleSend = () => {
        if (!recipient) {
            alert("Please select a recipient to send a message.");
            return;
        }
        if (!message.trim()) {
            alert("Message cannot be empty.");
            return;
        }

        // Format the message to send via WebSocket
        const formattedMessage = `${recipient.id}:${message}`; // Format as "recipient_id:message"
        websocketRef.current.send(formattedMessage); // Send message over WebSocket

        // Add the message to the chat box immediately in the same format as chat history
        setChatMessages((prevMessages) => [
            ...prevMessages,
            { sender: "You", content: message }, // Ensure consistent formatting
        ]);

        setMessage(""); // Clear the input field
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };


    const handleStartChat = async () => {
        if (!email.trim()) {
            alert("Please enter a valid email!");
            return;
        }

        try {
            // Fetch recipient details
            const userResponse = await fetch(`https://44.215.29.97:8000/get-user-email?email=${encodeURIComponent(email)}`);
            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    alert("User not found. Please check the email and try again.");
                    return;
                }
                throw new Error(`Failed to fetch user data. Status: ${userResponse.status}`);
            }

            const { user } = await userResponse.json();
            console.log("Fetched user:", user);

            // Add user to the friends list only if not already present
            setFriendsList((prevFriends) => {
                console.log("prevFriends list:", friendsList);
                // Check if user already exists in the updated friends list
                const alreadyExists = prevFriends.some((friend) => friend.id === user.id);
                console.log("Exist?", alreadyExists);
                if (!alreadyExists) {
                    alert(`${user.username} has been added to your friends list!`);
                    return [...prevFriends, user];
                } else {
                    alert("User is already in your friends list!");
                    setRecipient(user); // Set as recipient if already in friends list
                }
                return prevFriends; // Do nothing if already exists
            });


            // Fetch chat history
            const chatResponse = await fetch(`https://44.215.29.97:8000/chat-history/${currentId}/${user.id}`);
            if (!chatResponse.ok) {
                throw new Error(`Failed to fetch chat history. Status: ${chatResponse.status}`);
            }

            const { history } = await chatResponse.json();
            console.log("Fetched chat history:", history);
            // Transform history to include sender name
            const transformedHistory = history.map(([sender_id, recipient_id, content]) => ({
                sender: sender_id === currentId ? "You" : user.username,
                content,
            }));

            setChatMessages(transformedHistory);

        } catch (error) {
            console.error("Error in handleStartChat:", error);
            alert("An error occurred while starting the chat. Please try again.");
        }

        setEmail(""); // Clear the input field
    };


    const handleSelectFriend = async (friend) => {
        try {
            setRecipient(friend); // Update the current recipient
            console.log(`Switched to chat with: ${friend.username}`);

            // Fetch chat history for the selected friend
            const chatResponse = await fetch(
                `https://44.215.29.97:8000/chat-history/${currentId}/${friend.id}`
            );
            if (!chatResponse.ok) {
                throw new Error(`Failed to fetch chat history. Status: ${chatResponse.status}`);
            }

            const { history } = await chatResponse.json();
            console.log("Fetched chat history:", history);

            // Transform history to include sender name
            const transformedHistory = history.map(([sender_id, recipient_id, content]) => ({
                sender: sender_id === currentId ? "You" : friend.username,
                content,
            }));

            setChatMessages(transformedHistory); // Update chat messages
        } catch (error) {
            console.error("Error in handleSelectFriend:", error);
            alert("Failed to switch chat. Please try again.");
        }
    };


    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (loading) {
        // Show a loading spinner or placeholder until user data is ready
        return <div>Loading...</div>;
    }

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
                                <li
                                    key={friend.id}
                                    onClick={() => handleSelectFriend(friend)} // Click handler
                                    className="friend-item"
                                >
                                    {friend.username}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="chat-area">
                <div className="chat-header">
                    <span>{recipient ? "Chat With " + recipient.username : "Select a friend"}</span>
                </div>
                <div className="chat-box">
                    {chatMessages.length === 0 ? (
                        <p>No messages yet. Start the conversation!</p>
                    ) : (
                        chatMessages.map((msg, index) => (
                            <p key={index}>
                                <strong>{msg.sender}:</strong> {msg.content}
                            </p>
                        ))
                    )}
                </div>
                <div className="chat-input">
                    <textarea
                        type="text"
                        placeholder="Type a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}/>
                    <button onClick={handleSend} className="send-button">Send</button>
                </div>
            </div>
        </div>
    );
};

// // Add PropTypes validation
// ChatPage.propTypes = {
//     friendsList: PropTypes.arrayOf(
//         PropTypes.shape({
//             id: PropTypes.number.isRequired,
//             username: PropTypes.string.isRequired,
//             email: PropTypes.string.isRequired,
//         })
//     ).isRequired,
//     setFriendsList: PropTypes.func.isRequired,
// };

export default ChatPage;
