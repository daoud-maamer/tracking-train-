import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { fetchPendingItems, approveRejectItem } from '../services/api';

const API_BASE = 'http://192.168.1.10:3000';

const AdminScreen = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await fetchPendingItems();
            setPendingItems(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load pending items. Make sure you have admin rights.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await approveRejectItem(id, status);
            Alert.alert('Success', `Item ${status}`);
            loadItems(); // refresh list
        } catch (error) {
            Alert.alert('Error', 'Failed to update item status');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.type === 'lost' ? 'Lost' : 'Found'}: {item.item}</Text>
            <Text style={styles.text}>Author: {item.author}</Text>
            <Text style={styles.text}>Description: {item.description || 'N/A'}</Text>
            <Text style={styles.text}>Contact: {item.contact}</Text>

            {item.image_url && (
                <Image
                    source={{ uri: `${API_BASE}${item.image_url}` }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            )}

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, styles.approveBtn]} onPress={() => handleAction(item.id, 'approved')}>
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.rejectBtn]} onPress={() => handleAction(item.id, 'rejected')}>
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {pendingItems.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No pending items to review.</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingItems}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 5 },
    text: { fontSize: 14, color: '#333', marginBottom: 3 },
    itemImage: { width: '100%', height: 150, borderRadius: 8, marginTop: 10, marginBottom: 5 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    button: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    approveBtn: { backgroundColor: '#4CAF50' },
    rejectBtn: { backgroundColor: '#F44336' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    emptyText: { fontSize: 16, color: '#666' }
});

export default AdminScreen;
