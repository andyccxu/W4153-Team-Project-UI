import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../provider/authProvider';

function GoogleLoginComp() {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth(); // from authProvider.js

    return (
        <div>
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    console.log(credentialResponse);

                    // get id_token from google login
                    const id_token = credentialResponse.credential;
                    const client_id = credentialResponse.clientId;
                    setToken(id_token);
                    setUser({
                        email: '',
                        username: ''
                    });
                    navigate('/');
                    // visit a backend api (with id_token) to fetch user info
                    try {
                        const res = await axios.get(
                            `${import.meta.env.VITE_GW_BASE_URL}/exchange_token_with_google?client_id=${client_id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${id_token}`,
                                    google_id_token: id_token,
                                    client_id: client_id
                                }
                            }
                        );

                        const userinfo = res.data.userinfo;
                        setUser({
                            email: userinfo['email'],
                            username: userinfo['name']
                        });

                        const security_token = res.data.token;
                        localStorage.setItem('security_token', security_token);
                    } catch (error) {
                        alert('Token exchange failed');
                        console.log(error);
                    }
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>
    );
}

export default GoogleLoginComp;
