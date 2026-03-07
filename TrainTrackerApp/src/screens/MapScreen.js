import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView, Animated, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { fetchTrains } from '../services/api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const STATIONS = [
    { name: 'Tunis Ville', latitude: 36.7953, longitude: 10.1806, id: 0 },
    { name: 'Mégrine', latitude: 36.7686, longitude: 10.2336, id: 1 },
    { name: 'Radès', latitude: 36.7667, longitude: 10.2833, id: 2 },
    { name: 'Ezzahra', latitude: 36.7439, longitude: 10.3083, id: 3 },
    { name: 'Hammam Lif', latitude: 36.7287, longitude: 10.3416, id: 4 },
    { name: 'Hammam Chott', latitude: 36.7217, longitude: 10.3583, id: 5 },
    { name: 'Borj Cédria', latitude: 36.6881, longitude: 10.3779, id: 6 },
];

const STATION_HEIGHT = 100;

const MapScreen = () => {
    const [trains, setTrains] = React.useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null);
    const [notifiedTrains, setNotifiedTrains] = useState(new Set());

    // Store previous positions to calculate direction
    const prevTrainsRef = useRef({});

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getETA = (trainLat, trainLon, stationLat, stationLon) => {
        const distance = calculateDistance(trainLat, trainLon, stationLat, stationLon);
        const averageSpeed = 45;
        const timeInMinutes = Math.round((distance / averageSpeed) * 60);
        return timeInMinutes;
    };

    // Calculate vertical position of a train on the schematic line
    const getTrainPosition = (trainLat, trainLong) => {
        // Simple linear interpolation based on latitude (North to South)
        const startLat = STATIONS[0].latitude;
        const endLat = STATIONS[STATIONS.length - 1].latitude;

        // Normalize position between 0 and 1
        let progress = (startLat - trainLat) / (startLat - endLat);
        progress = Math.max(0, Math.min(1, progress));

        const totalHeight = (STATIONS.length - 1) * STATION_HEIGHT;
        return progress * totalHeight;
    };

    const loadTrains = useCallback(async () => {
        try {
            const data = await fetchTrains();
            const enhancedData = data.map(train => {
                const prev = prevTrainsRef.current[train.train_id];
                let direction = null; // null represents no change or unknown yet

                if (prev) {
                    if (parseFloat(train.latitude) < prev.latitude) {
                        direction = 'down'; // Moving towards Borj Cédria (South)
                    } else if (parseFloat(train.latitude) > prev.latitude) {
                        direction = 'up'; // Moving towards Tunis Ville (North)
                    } else {
                        direction = prev.direction; // Keep old direction if stationary
                    }
                }

                prevTrainsRef.current[train.train_id] = {
                    latitude: parseFloat(train.latitude),
                    direction
                };

                return { ...train, direction };
            });
            setTrains(enhancedData);
        } catch (error) {
            console.error('Failed to load trains', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Notification permissions not granted');
            }
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        loadTrains();
        const intervalId = setInterval(loadTrains, 10000);
        return () => clearInterval(intervalId);
    }, [loadTrains]);

    useEffect(() => {
        if (!selectedStation || trains.length === 0) return;

        let newNotifiedTrains = new Set(notifiedTrains);
        let updated = false;

        trains.forEach(train => {
            const eta = getETA(parseFloat(train.latitude), parseFloat(train.longitude), selectedStation.latitude, selectedStation.longitude);
            const trainKey = `${train.train_id}-${selectedStation.id}`;

            if (eta <= 1 && !notifiedTrains.has(trainKey)) {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Train à l'approche ! 🚆",
                        body: `Le train #${train.train_id} arrive à ${selectedStation.name} dans environ 1 minute.`,
                        sound: true,
                    },
                    trigger: null,
                });

                // Fallback for Expo Go since expo-notifications throws warnings there
                Alert.alert(
                    "Train à l'approche ! 🚆",
                    `Le train #${train.train_id} arrive à ${selectedStation.name} dans environ 1 minute.`
                );

                newNotifiedTrains.add(trainKey);
                updated = true;
            }
        });

        if (updated) {
            setNotifiedTrains(newNotifiedTrains);
        }
    }, [trains, selectedStation, notifiedTrains]);

    if (loading && trains.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Connexion au réseau SNCFT...</Text>
            </View>
        );
    }

    const nextTrainETA = selectedStation && trains.length > 0
        ? Math.min(...trains.map(t => getETA(parseFloat(t.latitude), parseFloat(t.longitude), selectedStation.latitude, selectedStation.longitude)))
        : null;

    return (
        <View style={styles.container}>
            {/* Header / Dashboard */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ligne Banlieue Sud</Text>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Gare de destination</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedStation}
                            onValueChange={(itemValue) => setSelectedStation(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Choisir une gare..." value={null} />
                            {STATIONS.map((station, index) => (
                                <Picker.Item key={index} label={station.name} value={station} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {selectedStation && (
                    <View style={styles.etaBanner}>
                        <Text style={styles.etaMainText}>
                            {nextTrainETA !== null ? `Prochain train dans ${nextTrainETA} min` : "Aucun train en mouvement"}
                        </Text>
                        <Text style={styles.etaSubText}>Vers {selectedStation.name}</Text>
                    </View>
                )}
            </View>

            {/* Schematic Line View */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.lineWrapper}>
                    {/* The Rail Line */}
                    <View style={styles.railLine} />

                    {/* Stations */}
                    {STATIONS.map((station, index) => {
                        const isSelected = selectedStation && selectedStation.id === station.id;
                        return (
                            <View key={index} style={[styles.stationRow, { top: index * STATION_HEIGHT }]}>
                                <View style={[styles.stationDot, isSelected && styles.selectedStationDot]}>
                                    {isSelected && <View style={styles.selectedStationInner} />}
                                </View>
                                <Text style={[styles.stationName, isSelected && styles.selectedStationName]}>
                                    {station.name}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Moving Trains */}
                    {trains.map((train, index) => {
                        const pos = getTrainPosition(parseFloat(train.latitude), parseFloat(train.longitude));
                        let arrow = '';
                        if (train.direction === 'down') arrow = '⬇️';
                        else if (train.direction === 'up') arrow = '⬆️';

                        return (
                            <View
                                key={`train-${index}`}
                                style={[styles.trainMarker, { transform: [{ translateY: pos }] }]}
                            >
                                <Text style={styles.trainEmoji}>🚆</Text>
                                <View style={styles.trainInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.trainId}>#{train.train_id}</Text>
                                        {arrow !== '' && <Text style={{ fontSize: 10, marginLeft: 4 }}>{arrow}</Text>}
                                    </View>
                                    <Text style={styles.trainSpeed}>{train.speed} km/h</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 4,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E3A8A',
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    pickerContainer: {
        marginBottom: 10,
    },
    pickerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    pickerWrapper: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    etaBanner: {
        marginTop: 15,
        backgroundColor: '#1E3A8A',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    etaMainText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    etaSubText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 2,
    },
    scrollContent: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    lineWrapper: {
        width: '100%',
        paddingHorizontal: 40,
        height: (STATIONS.length - 1) * STATION_HEIGHT + 40,
    },
    railLine: {
        position: 'absolute',
        left: 47,
        top: 7,
        bottom: 7,
        width: 6,
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
    },
    stationRow: {
        position: 'absolute',
        left: 40,
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
    },
    stationDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 4,
        borderColor: '#9CA3AF',
        zIndex: 5,
    },
    selectedStationDot: {
        borderColor: '#F59E0B',
        backgroundColor: '#F59E0B',
        transform: [{ scale: 1.2 }],
    },
    selectedStationInner: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        margin: 2,
    },
    stationName: {
        marginLeft: 20,
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    selectedStationName: {
        color: '#1E3A8A',
        fontWeight: '800',
        fontSize: 18,
    },
    trainMarker: {
        position: 'absolute',
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 20,
    },
    trainEmoji: {
        fontSize: 32,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    trainInfo: {
        marginLeft: 10,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
    },
    trainId: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E3A8A',
    },
    trainSpeed: {
        fontSize: 8,
        color: '#6B7280',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#1E3A8A',
        fontWeight: '500',
    }
});

export default MapScreen;
