import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../provider/authProvider.jsx";
import { ProtectedRoute } from "./ProtectedRoute";

import LoginPage from '../components/login-page.jsx';
import SignupPage from '../components/signup-page.jsx';
import ChatPage from '../components/chat-page.jsx';
import UserHeader from '../components/user-header.jsx';


const Routes = () => {
    const { token } = useAuth();

    // Define public routes accessible to all users
    const routesForPublic = [
        {
            path: "/about-us",
            element: <div>About Us</div>,
        },
    ];

    // Define routes accessible only to authenticated users
    const routesForAuthenticatedOnly = [
        {
            path: "/",
            element: (
                <>
                    <UserHeader />
                    <ProtectedRoute />
                </>
            ),
            children: [
                {
                    path: "/chat",
                    element: <ChatPage />,
                },
                // {
                //     path: "/main-feed",
                //     element: <ChatPage />,
                // }
            ],
        },
    ];

    // Define routes accessible only to non-authenticated users
    const routesForNotAuthenticatedOnly = [
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/signup",
            element: <SignupPage />,
        },
    ];

    // Combine and conditionally include routes based on authentication status
    const router = createBrowserRouter([
        ...routesForPublic,
        ...(!token ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticatedOnly,
    ]);

    // Provide the router configuration using RouterProvider
    return <RouterProvider router={router} />;
};

export default Routes;
