// reference:
// https://dev.to/sanjayttg/jwt-authentication-in-react-with-react-router-1d03

import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { googleLogout } from '@react-oauth/google';

// init an empty context object to share authentication state between components
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    // State to hold the authentication token and user data
    const [token, setToken_] = useState(localStorage.getItem("token"));
    const [user, setUser_] = useState(JSON.parse(localStorage.getItem("user")));

    // Function to set the authentication token
    const setToken = (newToken) => {
        setToken_(newToken);
    };


    // Function to set the user data
    const setUser = (newUser) => {
        setUser_(newUser);
    };

    // Function to handle user logout
    const logout = () => {
        googleLogout();    // Log out from Google
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Memoized value of the authentication context
    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            user,
            setUser,
            logout,
        }),
        [token, user] // the dependencies
    );

    // Provide the authentication context to the children components
    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;
