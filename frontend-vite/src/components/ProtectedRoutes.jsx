import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoutes({ isLoggedIn, checkingAuth, children }) {
    if (checkingAuth) return <p>Checking Session...</p>; // show loading while checking
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}