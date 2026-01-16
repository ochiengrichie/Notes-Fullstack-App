import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USER_BASE = `${API_URL}/api/v1/users`;

export default function Register({ email, setEmail, password, setPassword, register, fetchNotes, setIsLoggedIn }) {
    const navigate = useNavigate()
    return (
        <div className="page-center">
            <div className="login-component">
                <h2>Register</h2>
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
                <button onClick={register}>Register</button>
                <br/><br/>
                <GoogleLogin 
                    onSuccess={async (CredentialReceived) => {
                        const credential = CredentialReceived.credential;
                        try{
                        await axios.post(`${USER_BASE}/google`, { credential }, { withCredentials: true });
                        fetchNotes();
                        setIsLoggedIn(true);
                        navigate("/");
                        } catch (err) {
                            console.error("Google Registration Failed" ,err.response?.data || err.message);
                        
                        }
                    }}
                    onError={ () => {
                        console.log("Google Registration Failed");
                    }}
                />
            </div>
        </div>
    );
}