import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USER_BASE = `${API_URL}/api/v1/users`;

export default function Login({ email, setEmail, password, setPassword, login,setIsLoggedIn, fetchNotes, error, setError, setCurrentUserEmail }) {
    const navigate = useNavigate();
    return (
        <div className="page-center">
            <div className="login-component">
                <div className="auth-copy">
                    <p className="auth-eyebrow">Welcome back</p>
                    <h2>Login</h2>
                    <p className="auth-subtitle">Sign in to manage your notes and keep them in sync.</p>
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="auth-form">
                    <label className="auth-field">
                        <span>Email</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label className="auth-field">
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button className="auth-primary" onClick={login}>Login</button>
                </div>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="auth-google">
                    <GoogleLogin  
                        onSuccess={async (credentialResponse) => {
                            const credential = credentialResponse.credential;
                            try {
                            setError("");
                            await axios.post(`${USER_BASE}/google`, { credential }, { withCredentials: true});
                            setCurrentUserEmail(email || "Google user");
                            window.localStorage.setItem("notes-user-email", email || "Google user");
                            await fetchNotes();
                            setIsLoggedIn(true);
                            navigate("/");
                            } catch (err) {
                            console.error("Google login failed:", err.response?.data || err.message);
                            setError(err.response?.data?.error || "Google login failed");
                            }
                        }}
                        onError={() => {
                            console.log('Login Failed');
                            setError("Google login failed");
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
                
