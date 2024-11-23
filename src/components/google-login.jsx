import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';

function GoogleLogin() {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth(); // from authProvider.js
    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            try {
                // Fetch the user's profile
                const res = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${codeResponse.access_token}`,
                            Accept: 'application/json'
                        }
                    }
                );

                // Set the access token in the context
                setToken(codeResponse.access_token);
                // Set the user profile in the context
                res.data.username = res.data.name;
                setUser(res.data);
                navigate('/');
            } catch (error) {
                console.error('Error fetching Google user info:', error);
            }
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    return (
        <div>
            <button className="btn btn-secondary w-50" onClick={() => login()}>
                Sign in with Google 🚀
            </button>
        </div>
    );
}

export default GoogleLogin;
