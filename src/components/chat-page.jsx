import { useState } from 'react';
import './chat-page.css';

const initialFriendsList = [
    { id: 1, name: 'Alice', messages: [] },
];

const initialGroups = [
    { id: 1, name: 'Group 1', members: [1, 2], messages: [{ sender: 'Alice', content: 'Welcome to Group 1!' }] },
    { id: 2, name: 'Group 2', members: [3, 4], messages: [{ sender: 'Charlie', content: 'Welcome to Group 2!' }] }
];

const currentUser = 'You';

const ChatPage = () => {
    const [friendsList, setFriendsList] = useState(initialFriendsList);
    const [groupsList, setGroupsList] = useState(initialGroups);
    const [selectedChat, setSelectedChat] = useState({ type: 'private', id: 1 });
    const [newMessage, setNewMessage] = useState('');
    const [newFriendName, setNewFriendName] = useState('');
    const [newGroupName, setNewGroupName] = useState('');


    const handleChatClick = (type, id) => {
        setSelectedChat({ type, id });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') {
            let updatedChats = [];

            if (selectedChat.type === 'private') {
                updatedChats = friendsList.map((friend) => {
                    if (friend.id === selectedChat.id) {
                        return {
                            ...friend,
                            messages: [...friend.messages, { sender: currentUser, content: newMessage }]
                        };
                    }
                    return friend;
                });
                setFriendsList(updatedChats);

                try {
                    const response = await fetch('http://44.215.29.97:8000/chat-history', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: currentUser,
                            recipient: updatedChats.find(friend => friend.id === selectedChat.id).name,
                            message: newMessage,
                        }),
                    });
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            } else if (selectedChat.type === 'group') {
                const updatedGroups = groupsList.map((group) => {
                    if (group.id === selectedChat.id) {
                        return {
                            ...group,
                            messages: [...group.messages, { sender: currentUser, content: newMessage }]
                        };
                    }
                    return group;
                });
                setGroupsList(updatedGroups);

                try {
                    const response = await fetch('http://44.215.29.97:8000/chat-history', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: currentUser,
                            group: updatedGroups.find(group => group.id === selectedChat.id).name,
                            message: newMessage,
                        }),
                    });
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }

            setNewMessage('');
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
            <div className="friends-and-groups">
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
                        placeholder="New friend's name"
                    />
                    <button onClick={handleAddNewFriend}>Add New Friend</button>
                </div>
            </div>

            <div className="groups-list">
                <h2>Groups</h2>
                {groupsList.map((group) => (
                    <div
                        key={group.id}
                        className={`group-item ${selectedChat.type === 'group' && selectedChat.id === group.id ? 'active' : ''}`}
                        onClick={() => handleChatClick('group', group.id)}
                    >
                        {group.name}
                    </div>
                ))}

                <div className="add-group-section">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="New group name"
                    />
                    <button onClick={handleAddNewGroup}>Add New Group</button>
                </div>
            </div>
            </div>

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
