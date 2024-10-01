import { useState } from 'react';
import './chat-page.css';

const initialFriendsList = [
    { id: 1, name: 'Alice', messages: [] },
    { id: 2, name: 'Bob', messages: [] },
    { id: 3, name: 'Charlie', messages: [] },
    { id: 4, name: 'Dave', messages: [] },
];

// Initial groups with members and messages
const initialGroups = [
    { id: 1, name: 'Group 1', members: [1, 2], messages: [{ sender: 'Alice', content: 'Welcome to Group 1!' }] },
    { id: 2, name: 'Group 2', members: [3, 4], messages: [{ sender: 'Charlie', content: 'Welcome to Group 2!' }] }
];

const currentUser = 'You'; // Mock the current user as "You"

const ChatPage = () => {
    const [friendsList, setFriendsList] = useState(initialFriendsList);
    const [groupsList, setGroupsList] = useState(initialGroups); // For managing groups
    const [selectedChat, setSelectedChat] = useState({ type: 'private', id: 1 }); // Track which chat is selected (private or group)
    const [newMessage, setNewMessage] = useState('');
    const [newFriendName, setNewFriendName] = useState('');
    const [newGroupName, setNewGroupName] = useState('');

    const handleChatClick = (type, id) => {
        setSelectedChat({ type, id });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') {
            if (selectedChat.type === 'private') {
                const updatedChats = friendsList.map((friend) => {
                    if (friend.id === selectedChat.id) {
                        return {
                            ...friend,
                            messages: [...friend.messages, { sender: currentUser, content: newMessage }]
                        };
                    }
                    return friend;
                });
                setFriendsList(updatedChats);
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
            }
            setNewMessage('');
        }
    };

    const handleAddNewFriend = () => {
        if (newFriendName.trim() !== '') {
            const newFriendId = friendsList.length + 1;
            setFriendsList([...friendsList, { id: newFriendId, name: newFriendName }]);
            setNewFriendName(''); // Clear input
        }
    };

    const handleAddNewGroup = () => {
        if (newGroupName.trim() !== '') {
            const newGroupId = groupsList.length + 1;
            setGroupsList([...groupsList, { id: newGroupId, name: newGroupName, members: [], messages: [] }]);
            setNewGroupName(''); // Clear input
        }
    };

    // Retrieve messages for private chat or group chat
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
            {/* Friends List Section */}
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

                {/* Button to add a new friend */}
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

            {/* Groups List Section */}
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

                {/* Button to add a new group */}
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

            {/* Chat Section */}
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
