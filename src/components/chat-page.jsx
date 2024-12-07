import { useState, useEffect } from 'react';
import './chat-page.css';


const currentUser = 'user1';

const ChatPage = () => {
    const [friendsList, setFriendsList] = useState([
        {
            id: 1,
            name: 'user2',
            messages: [
                { sender: 'user2', content: 'Hey, how are you?' },
            ]
        }
    ]);
    const [groupsList, setGroupsList] = useState([]);
    const [selectedChat, setSelectedChat] = useState({ type: 'private', id: 1 });
    const [newMessage, setNewMessage] = useState('');
    const [newFriendName, setNewFriendName] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [websocket, setWebSocket] = useState(null);


    const initializeWebSocket = () => {
        const ws = new WebSocket(`ws://44.215.29.97:8000/ws/${currentUser}`);

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

    const fetchChatHistory = async (type, id) => {
        let endpoint = '';
        if (type === 'private') {
            const friend = friendsList.find(friend => friend.id === id);
            endpoint = `http://44.215.29.97:8000/chat-history?sender=${currentUser}&recipient=${friend.name}&limit=10`;
        } else if (type === 'group') {
            const group = groupsList.find(group => group.id === id);
            endpoint = `http://44.215.29.97:8000/chat-history?group=${group.name}&limit=10`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        setChatMessages(data.history);  // Set chat messages from the backend
    };

    async function createGroup(groupName, description) {
        const response = await fetch("/create-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupName, description })
        });
        if (response.ok) {
            const result = await response.json();
            console.log("Group created:", result);
        } else {
            console.error("Group creation failed:", await response.json());
        }
    }

    async function joinGroup(username, groupName) {
        const response = await fetch("/join-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, groupName })
        });
        if (response.ok) {
            const result = await response.json();
            console.log("Joined group:", result);
        } else {
            console.error("Join group failed:", await response.json());
        }
    }

    useEffect(() => {
        initializeWebSocket();
        return () => {
            if (websocket) {
                websocket.close();  // Clean up WebSocket connection on unmount
            }
        };
    }, []);

    const handleChatClick = async (type, id) => {
        setSelectedChat({ type, id });
        // const messages = type === 'private'
        //     ? friendsList.find((friend) => friend.id === id).messages|| []
        //     : groupsList.find((group) => group.id === id).messages|| [];
        // setChatMessages(messages);
        await fetchChatHistory(type, id);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '' && websocket && websocket.readyState === WebSocket.OPEN) {
            let messageToSend = '';

            if (selectedChat.type === 'private') {
                const recipient = friendsList.find(friend => friend.id === selectedChat.id)?.name;
                messageToSend = `${recipient}:${newMessage}`;

                const updatedFriends = friendsList.map(friend => {
                    if (friend.id === selectedChat.id) {
                        return {
                            ...friend,
                            messages: [...friend.messages, { sender: 'user1', content: newMessage }]
                        };
                    }
                    return friend;
                });
                setFriendsList(updatedFriends);
            } else if (selectedChat.type === 'group') {
                const groupName = groupsList.find(group => group.id === selectedChat.id)?.name;
                messageToSend = `group:${groupName}:${newMessage}`;

                const updatedGroups = groupsList.map(group => {
                    if (group.id === selectedChat.id) {
                        return {
                            ...group,
                            messages: [...group.messages, { sender: currentUser, content: newMessage }]
                        };
                    }
                    return group;
                });
                setGroupsList(updatedGroups);
            }

            websocket.send(messageToSend);

            setChatMessages([...chatMessages, { sender: currentUser, content: newMessage }]);

            setNewMessage('');
        } else {
            console.error('WebSocket is not open or message is empty');
        }
    };


    const handleAddNewFriend = () => {
        if (newFriendName.trim() !== '') {
            const newFriendId = friendsList.length + 1;
            setFriendsList([...friendsList, { id: newFriendId, name: newFriendName }]);
            setNewFriendName('');
        }
    };

    const handleAddNewGroup = () => {
        if (newGroupName.trim() !== '') {
            const newGroupId = groupsList.length + 1;
            setGroupsList([...groupsList, { id: newGroupId, name: newGroupName, members: [], messages: [] }]);
            setNewGroupName('');
        }
    };

    const getChatMessages = () => {
        if (selectedChat.type === 'private') {
            const selectedFriend = friendsList.find((f) => f.id === selectedChat.id);
            return selectedFriend ? selectedFriend.messages : [];
        } else if (selectedChat.type === 'group') {
            const selectedGroup = groupsList.find((group) => group.id === selectedChat.id);
            return selectedGroup ? selectedGroup.messages : [];
        }
        return [];
    };

    return (
        <div className="chat-page">
            {/*<div className="friends-and-groups">*/}
            <div className="friends-list">
                <h2>Friends</h2>
                {friendsList.map((friend) => (
                    <div
                        key={friend.id}
                        className={`friend-item ${selectedChat.type === 'private' && selectedChat.id === friend.id ? 'active' : ''}`}
                        onClick={() => handleChatClick('private', friend.id)}
                    >
                        {friend.name}
                    </div>
                ))}

                <div className="add-friend-section">
                    <input
                        type="text"
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                        placeholder="Friend's ID"
                    />
                    <button onClick={handleAddNewFriend}>Add New Friend</button>
                </div>
            </div>

            {/*<div className="groups-list">*/}
            {/*    <h2>Groups</h2>*/}
            {/*    {groupsList.map((group) => (*/}
            {/*        <div*/}
            {/*            key={group.id}*/}
            {/*            className={`group-item ${selectedChat.type === 'group' && selectedChat.id === group.id ? 'active' : ''}`}*/}
            {/*            onClick={() => handleChatClick('group', group.id)}*/}
            {/*        >*/}
            {/*            {group.name}*/}
            {/*        </div>*/}
            {/*    ))}*/}

            {/*    <div className="add-group-section">*/}
            {/*        <input*/}
            {/*            type="text"*/}
            {/*            value={newGroupName}*/}
            {/*            onChange={(e) => setNewGroupName(e.target.value)}*/}
            {/*            placeholder="New group name"*/}
            {/*        />*/}
            {/*        <button onClick={handleAddNewGroup}>Create Group</button>*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*</div>*/}

            <div className="chat-section">
                <div className="chat-header">
                    <h2>
                        {selectedChat.type === 'private'
                            ? `Chat with ${friendsList.find((f) => f.id === selectedChat.id)?.name}`
                            : `Group: ${groupsList.find((group) => group.id === selectedChat.id)?.name}`}
                    </h2>
                </div>

                <div className="chat-messages">
                    {getChatMessages().map((msg, index) => (
                        <div key={index} className="chat-message">
                            <strong>{msg.sender === currentUser ? 'You' : msg.sender}</strong>: {msg.content}
                        </div>
                    ))}
                </div>

                <form className="chat-input-section" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
