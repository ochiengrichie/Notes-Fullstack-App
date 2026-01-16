import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({ isLoggedIn, logout }) {
  return (
    <nav className="navbar">
      <h1>Notes App</h1>
      <div>
        {isLoggedIn ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
