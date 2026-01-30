import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem("token");

    // Show loading if we are fetching user, OR if we have a token but user state hasn't updated yet
    if (loading || (token && !user)) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || !token) {
        // Redirect to login if user is not authenticated or token is missing
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
