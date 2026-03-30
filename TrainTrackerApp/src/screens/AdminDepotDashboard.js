import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const AdminDepotDashboard = ({ navigation }) => {
    const { logout } = useContext(AuthContext);
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchTrains = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/trains`);
            const data = await response.json();
            setTrains(data);
        } catch (error) {
            console.error('Error fetching trains:', error);
            Alert.alert('Error', 'Failed to fetch trains');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrains();
        // Refresh every 5 seconds
        const interval = setInterval(fetchTrains, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleStatus = async (trainId, currentIsStopped) => {
        setActionLoading(trainId);
        try {
            const response = await fetch(`${API_BASE_URL}/trains/${trainId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isStopped: !currentIsStopped })
            });

            if (response.ok) {
                // Instantly update UI for perfect snappiness, avoiding an extra network request
                setTrains(prevTrains => 
                    prevTrains.map(train => 
                        train.train_id === trainId ? { ...train, isStopped: !currentIsStopped } : train
                    )
                );
            } else {
                Alert.alert('Error', 'Failed to update train status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Network error while updating status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.replace('Login');
    };

    const renderTrainItem = ({ item }) => (
        <View style={styles.trainCard}>
            <View style={styles.trainInfo}>
                <Text style={styles.trainTitle}>{item.train_id}</Text>
                <Text style={styles.trainSpeed}>Vitesse: {Math.round(item.speed)} km/h</Text>
                <Text style={[styles.trainStatus, item.isStopped ? styles.statusStopped : styles.statusRunning]}>
                    Statut: {item.isStopped ? 'Arrêté' : 'En Mouvement'}
                </Text>
            </View>
            <TouchableOpacity 
                style={[styles.actionButton, item.isStopped ? styles.releaseButton : styles.stopButton]}
                onPress={() => handleToggleStatus(item.train_id, item.isStopped)}
                disabled={actionLoading === item.train_id}
            >
                {actionLoading === item.train_id ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.actionText}>{item.isStopped ? 'Lancer' : 'Arrêter'}</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin de Dépôt</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1E3A8A" />
                </View>
            ) : (
                <FlatList
                    data={trains}
                    keyExtractor={(item) => item.train_id}
                    renderItem={renderTrainItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>Aucun train disponible</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1E3A8A',
        marginTop: 40,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
    },
    trainCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    trainInfo: {
        flex: 1,
    },
    trainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    trainSpeed: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    trainStatus: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusRunning: {
        color: '#2ecc71',
    },
    statusStopped: {
        color: '#e74c3c',
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#e74c3c',
    },
    releaseButton: {
        backgroundColor: '#2ecc71',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 50,
        fontSize: 16,
    }
});

export default AdminDepotDashboard;
