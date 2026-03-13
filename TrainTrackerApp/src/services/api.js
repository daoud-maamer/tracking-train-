import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: Replace with your machine's IP address if testing on a physical device,
// OR leave as localhost/10.0.2.2 if testing on Android Emulator
const API_BASE_URL = 'http://192.168.1.10:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Auth routes ---
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const verifyEmail = async (email, code) => {
    const response = await api.post('/auth/verify', { email, code });
    return response.data;
};


// --- Train routes ---
export const fetchTrains = async () => {
    try {
        const response = await api.get('/trains');
        return response.data;
    } catch (error) {
        console.error('Error fetching trains from API', error);
        throw error;
    }
};

// --- Lost & Found routes ---

export const fetchLostItems = async () => {
    try {
        const response = await api.get('/lost-items');
        return response.data;
    } catch (error) {
        console.error('Error fetching lost items:', error);
        throw error;
    }
};

export const createLostItem = async (formData) => {
    try {
        const response = await api.post('/lost-items', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating lost item:', error);
        throw error;
    }
};

export const updateLostItemStatus = async (id, status) => {
    try {
        const response = await api.patch(`/lost-items/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating item status:', error);
        throw error;
    }
};

export const likeLostItem = async (id) => {
    try {
        const response = await api.patch(`/lost-items/${id}/like`);
        return response.data;
    } catch (error) {
        console.error('Error liking item:', error);
        throw error;
    }
};

// --- Admin ROUTES ---

export const fetchPendingItems = async () => {
    try {
        const response = await api.get('/lost-items/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending items', error);
        throw error;
    }
}

export const approveRejectItem = async (id, status) => {
    try {
        const response = await api.patch(`/lost-items/${id}/approve`, { status });
        return response.data;
    } catch (error) {
        console.error('Error approving/rejecting item', error);
        throw error;
    }
}


export default api;
