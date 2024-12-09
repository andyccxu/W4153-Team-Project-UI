import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId="745799261495-avvrllddrvmc56k5jqtm691p1n3tg1kr.apps.googleusercontent.com">
        <StrictMode>
            <App />
        </StrictMode>
        ,
    </GoogleOAuthProvider>
);
