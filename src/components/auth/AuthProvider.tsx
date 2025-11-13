import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosConfig';
import { apiRoutes } from '../../services/apiRoutes';

export interface User {
    id: number | string;
    email: string;
    partners: InputPartner[];
    access_token: string;
    // Add other relevant fields if needed
}

// Update the context type to include the user object
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // User object or null if not logged in
    partnersReady: boolean; // true when partners list has been fetched and stored
    loadingPartners: boolean; // true while fetching partners during login
    login: (userData: User) => void; // Login now accepts user data and token
    logout: () => void;
}

interface InputPartner {
    code: string;
}

interface Partner {
    name: string;
    id: string;
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

    // Track partner list readiness
    const [partnersReady, setPartnersReady] = useState<boolean>(() => {
        return !!localStorage.getItem('partners');
    });
    const [loadingPartners, setLoadingPartners] = useState<boolean>(false);

    const getPartnerInfo = useCallback(async (partner: string) => {
        const response = await axiosInstance.get(apiRoutes.GET_PARTNER_INFO(partner));
        console.log({ partner: response.data.data[0] });
        return {
            name: response.data.data[0].name,
            id: response.data.data[0].id,
        };
    }, []);

    const login = useCallback(async (userData: User) => { // <-- 1. Make the callback async
        // Store token and potentially some user info in localStorage
        localStorage.setItem('auth_token', 'Token ' + userData.access_token);

        // Update React state
        setIsAuthenticated(true);
        setUser(userData);
        console.log("AuthProvider: User logged in and state updated.", userData);

        setLoadingPartners(true);
        // 2. Use .map to create an array of promises
        const partnerInfoPromises = userData.partners.map(async (partner) => {
            let partnerInfo = await getPartnerInfo(partner.code);
            console.log({ partnerInfo: partnerInfo });
            // 3. Return the desired object from the map
            return {
                name: partnerInfo.name,
                id: partnerInfo.id,
            };
        });

        // 4. Wait for ALL promises to resolve
        const partnerInfos: Partner[] = await Promise.all(partnerInfoPromises);

        // 5. This code now runs ONLY after all API calls are complete
        console.log({ final: partnerInfos });
        localStorage.setItem('partners', JSON.stringify(partnerInfos));
        setPartnersReady(true);
        setLoadingPartners(false);

    }, [getPartnerInfo]); // <-- 6. Add getPartnerInfo to the dependency array

    // Logout function updated to clear user state
    const logout = useCallback(() => {
        // Clear all relevant localStorage items
        localStorage.removeItem('auth_token');
        localStorage.removeItem('partners');
        localStorage.removeItem('selected_partner');
        console.log('here')
        // Clear React state
        setIsAuthenticated(false);
        setUser(null);
        setPartnersReady(false);
        setLoadingPartners(false);
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
        partnersReady,
        loadingPartners,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
