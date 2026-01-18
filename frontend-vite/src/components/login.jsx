import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css"

const API_URL = import.meta.env.VITE_API_URL;
const USER_BASE = `${API_URL}/api/v1/users`;

export default function Login({ email, setEmail, password, setPassword, login,setIsLoggedIn, fetchNotes, error, setError }) {
    const navigate = useNavigate();
    return (
        <div className="page-center">
            <div className="login-component">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    /><br/><br/>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    /><br/><br/>
                <button onClick={login}>login</button>
                <br/>
                <br/>

                <GoogleLogin  
                    onSuccess={async (credentialResponse) => {
                        const credential = credentialResponse.credential;
                        try {
                        setError("");
                        await axios.post(`${USER_BASE}/google`, { credential }, { withCredentials: true});
                        await fetchNotes(); // fetch notes after login
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
    );
}
                