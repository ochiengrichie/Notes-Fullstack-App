import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USER_BASE = `${API_URL}/api/v1/users`;

export default function Login({ email, setEmail, password, setPassword, login,setIsLoggedIn, fetchNotes }) {
    const navigate = useNavigate();
    return (
        <div className="page-center">
            <div className="login-component">
                <h2>Login</h2>
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
                        await axios.post(`${USER_BASE}/google`, { credential }, { withCredentials: true});
                        await fetchNotes(); // fetch notes after login
                        setIsLoggedIn(true);
                        navigate("/");
                        } catch (err) {
                        console.error("Google login failed:", err.response?.data || err.message);
                        alert("Google login failed");
                        }
                    }}
                        
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />

            </div>
        </div>
    );
}
                