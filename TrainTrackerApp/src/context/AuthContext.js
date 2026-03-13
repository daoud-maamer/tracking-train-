import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Run once when the app starts
        const loadInitialAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUser = await AsyncStorage.getItem('userData');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load auth data', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialAuth();
    }, []);

    const loginUser = async (newToken, userData) => {
        try {
            await AsyncStorage.setItem('userToken', newToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
        } catch (e) {
            console.error('Failed to save auth data', e);
        }
    };

    const logoutUser = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Failed to clear auth data', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
