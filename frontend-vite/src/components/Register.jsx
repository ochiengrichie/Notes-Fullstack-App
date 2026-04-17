import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USER_BASE = `${API_URL}/api/v1/users`;

export default function Register({ email, setEmail, password, setPassword, register, fetchNotes, setIsLoggedIn,error, setError, setCurrentUserEmail }) {
    const navigate = useNavigate()
    return (
        <div className="page-center">
            <div className="login-component">
                <div className="auth-copy">
                    <p className="auth-eyebrow">Create account</p>
                    <h2>Register</h2>
                    <p className="auth-subtitle">Start saving notes to your personal workspace.</p>
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
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button className="auth-primary" onClick={register}>Register</button>
                </div>
                <div className="auth-divider">
                    <span>or continue with</span>
                </div>
                <div className="auth-google">
                    <GoogleLogin 
                        onSuccess={async (CredentialReceived) => {
                            const credential = CredentialReceived.credential;
                            try{
                            setError("");
                            await axios.post(`${USER_BASE}/google`, { credential }, { withCredentials: true });
                            setCurrentUserEmail(email || "Google user");
                            window.localStorage.setItem("notes-user-email", email || "Google user");
                            fetchNotes();
                            setIsLoggedIn(true);
                            navigate("/");
                            } catch (err) {
                                console.error("Google Registration Failed" ,err.response?.data || err.message);
                                setError(err.response?.data?.error || "Google Registration Failed");
                            }
                        }}
                        onError={ () => {
                            console.log("Google Registration Failed");
                            setError("Google Registration Failed");
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
