import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/login-page.jsx';
import SignupPage from './components/signup-page.jsx';
import ChatPage from './components/chat-page1.jsx';
import {useState} from "react";

function App() {
    const [friendsList, setFriendsList] = useState([
        { id: 1, username: "David Xu", email: "david@example.com" },
        { id: 2, username: "Charlotte", email: "charlotte@example.com" },
    ]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/chat" element={<ChatPage friendsList={friendsList} setFriendsList={setFriendsList}/>} />
            </Routes>
        </Router>
    );
}

export default App;
