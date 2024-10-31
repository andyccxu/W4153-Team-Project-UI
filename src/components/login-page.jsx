import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useAuth} from "../provider/authProvider.jsx";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // from AuthProvider
    const { setUser, setToken } = useAuth();

    // navigate hook
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // send http request to microservice
        const response = await fetch(`${ import.meta.env.VITE_AUTH_SERVICE_BASE_URL }/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            navigate('/');
        } else {
            console.log(response);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{maxWidth: '400px', width: '100%'}}>
                <h2 className="text-center mb-4">Login to <br/> Columbia Forum</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@columbia.edu"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>

                <p className="text-center pt-3">
                    Do not have an account? <Link to="/signup">Sign up now!</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
