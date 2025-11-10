import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Partner {
    code: string;
}

export interface User {
    id: number | string;
    email: string;
    partners: Partner[];
    access_token: string;
    // Add other relevant fields if needed
}

// Update the context type to include the user object
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // User object or null if not logged in
    login: (userData: User) => void; // Login now accepts user data and token
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate(); // Hook for navigation

    // State for authentication status, initialized from localStorage token
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const authToken = localStorage.getItem('auth_token');
        return !!authToken;
    });

    // State for user information, initialized to null
    const [user, setUser] = useState<User | null>(null);

    // Login function updated to accept user data and token
    const login = useCallback((userData: User) => {
        // Store token and potentially some user info in localStorage
        localStorage.setItem('auth_token', userData.access_token);
        localStorage.setItem('partners', JSON.stringify(userData.partners));

        // Update React state
        setIsAuthenticated(true);
        setUser(userData);
        console.log("AuthProvider: User logged in and state updated.", userData);

    }, []); // Removed navigate from dependencies, login action itself doesn't navigate

    // Logout function updated to clear user state
    const logout = useCallback(() => {
        // Clear all relevant localStorage items
        localStorage.removeItem('auth_token');
        localStorage.removeItem('partners');
        console.log('here')
        // Clear React state
        setIsAuthenticated(false);
        setUser(null);
        console.log("AuthProvider: User logged out, state cleared.");

        // Navigate to sign-in page after clearing state
        navigate('/login'); // Redirect after logout

    }, [navigate]); // Add navigate as dependency for logout redirection

    // Listen for storage changes (e.g., logout in another tab)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'auth_token') {
                 if (!event.newValue) { // Token was removed (logged out)
                    console.log("AuthProvider: Detected logout from another tab.");
                    setIsAuthenticated(false);
                    setUser(null);
                    navigate('/login', { replace: true }); // Redirect on logout
                 } else { // Token was added/changed (logged in elsewhere?)
                    // Optionally re-sync state or ignore
                 }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate]); // Add navigate as dependency

    // Provide the state and functions through the context
    const value: AuthContextType = {
        isAuthenticated,
        user, // Provide user object
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};