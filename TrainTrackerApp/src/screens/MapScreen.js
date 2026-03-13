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

// Raw haversine distance (km) between two GPS points — used at module level
const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const STATIONS_RAW = [
    { name: 'Gare de Tunis',    latitude: 36.7953, longitude: 10.1806, id: 0 },
    { name: 'Djebel Jelloud',   latitude: 36.7820, longitude: 10.1950, id: 1 },
    { name: 'Mégrine Riadh',   latitude: 36.7720, longitude: 10.2200, id: 2 },
    { name: 'Mégrine',          latitude: 36.7686, longitude: 10.2336, id: 3 },
    { name: 'Sidi Rezig',       latitude: 36.7650, longitude: 10.2500, id: 4 },
    { name: 'Radès Lycée',      latitude: 36.7660, longitude: 10.2650, id: 5 },
    { name: 'Radès',            latitude: 36.7667, longitude: 10.2833, id: 6 },
    { name: 'Radès Méliane',   latitude: 36.7620, longitude: 10.2700, id: 7 },
    { name: 'Ezzahra',          latitude: 36.7439, longitude: 10.3083, id: 8 },
    { name: 'Ezzahra Lycée',   latitude: 36.7400, longitude: 10.3200, id: 9 },
    { name: 'Boukornine',       latitude: 36.7320, longitude: 10.3300, id: 10 },
    { name: 'Hammam Lif',       latitude: 36.7287, longitude: 10.3416, id: 11 },
    { name: 'Arrêt du Stade',  latitude: 36.7265, longitude: 10.3450, id: 12 },
    { name: 'Tahar Sfar',       latitude: 36.7250, longitude: 10.3500, id: 13 },
    { name: 'Hammam Chott',     latitude: 36.7217, longitude: 10.3583, id: 14 },
    { name: 'Bir El Bey',       latitude: 36.6980, longitude: 10.3725, id: 15 },
    { name: 'Borj Cédria',     latitude: 36.6881, longitude: 10.3779, id: 16 },
    { name: 'Erriadh Station',  latitude: 36.6882, longitude: 10.3779, id: 17 },
];

// Auto-compute cumulative distances from real GPS coordinates
const STATIONS = STATIONS_RAW.map((s, i) => ({
    ...s,
    distanceKm: i === 0
        ? 0
        : STATIONS_RAW.slice(0, i).reduce((acc, cur, j) =>
            acc + haversineKm(STATIONS_RAW[j].latitude, STATIONS_RAW[j].longitude,
                              STATIONS_RAW[j + 1].latitude, STATIONS_RAW[j + 1].longitude)
          , 0),
}));

const STATION_HEIGHT = 100;

const MapScreen = () => {
    const [trains, setTrains] = React.useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null); // Departure
    const [selectedArrival, setSelectedArrival] = useState(null); // Arrival
    const [notifiedTrains, setNotifiedTrains] = useState(new Set());

    // Store previous positions to calculate direction
    const prevTrainsRef = useRef({});

    const calculateDistance = haversineKm;


    // New feature: Exact transit time between chosen stations
    const calculateTravelTime = (startStation, endStation) => {
        if (!startStation || !endStation || startStation.id === endStation.id) return 0;
        const distanceKm = Math.abs(startStation.distanceKm - endStation.distanceKm);
        return getETA(distanceKm);
    };

    const getETA = (distanceKm) => {
        const averageSpeed = 40; // 40 km/h average speed in suburban context (inherently includes stops)
        const timeInMinutes = Math.round((distanceKm / averageSpeed) * 60);
        return timeInMinutes;
    };

    // Project GPS coordinates onto the ordered 1D rail line.
    // We iterate over every sequential track segment A→B and find the closest
    // point on that segment. This works even when the track doubles back (Radès loop).
    const getTrainRouteDistance = useCallback((trainLat, trainLon) => {
        let bestDistKm = Infinity;  // best perpendicular distance to a segment
        let bestRouteKm = 0;        // corresponding 1D route distance

        for (let i = 0; i < STATIONS.length - 1; i++) {
            const A = STATIONS[i];
            const B = STATIONS[i + 1];

            // Segment vector in lat/lon degrees
            const abLat = B.latitude  - A.latitude;
            const abLon = B.longitude - A.longitude;

            // Vector from A to train
            const atLat = trainLat - A.latitude;
            const atLon = trainLon - A.longitude;

            // Project: t = (AT · AB) / |AB|²  — clamped to [0,1]
            const abLenSq = abLat * abLat + abLon * abLon;
            let t = abLenSq === 0 ? 0 : (atLat * abLat + atLon * abLon) / abLenSq;
            t = Math.max(0, Math.min(1, t));

            // Closest point on segment
            const closestLat = A.latitude  + t * abLat;
            const closestLon = A.longitude + t * abLon;

            // GPS distance from train to that closest point
            const perpDistKm = calculateDistance(trainLat, trainLon, closestLat, closestLon);

            if (perpDistKm < bestDistKm) {
                bestDistKm = perpDistKm;
                // 1D route distance = A's cumulative distance + fraction of A–B segment
                bestRouteKm = A.distanceKm + t * (B.distanceKm - A.distanceKm);
            }
        }

        return bestRouteKm;
    }, []);

    // Calculate vertical position of a train on the schematic line based on Route Distance
    const getTrainPosition = (trainRouteDistanceKm) => {
        const totalDistance = STATIONS[STATIONS.length - 1].distanceKm;
        let progress = trainRouteDistanceKm / totalDistance;
        progress = Math.max(0, Math.min(1, progress));

        const totalHeight = (STATIONS.length - 1) * STATION_HEIGHT;
        return progress * totalHeight;
    };

    const loadTrains = useCallback(async () => {
        try {
            const data = await fetchTrains();
            const singleTrainData = data.slice(0, 1); // Requirement: test with exactly 1 train
            
            const enhancedData = singleTrainData.map(train => {
                const prev = prevTrainsRef.current[train.train_id];
                let direction = prev ? prev.direction : null; // Default to previous known direction, or null if totally new

                const trainLat = parseFloat(train.latitude);
                const trainLon = parseFloat(train.longitude);
                const currentDistKm = getTrainRouteDistance(trainLat, trainLon);

                if (prev) {
                    // Filter out GPS noise (must move at least 100m to register direction change)
                    if (currentDistKm > prev.distanceKm + 0.1) {
                        direction = 'down'; // Moving away from Tunis
                    } else if (currentDistKm < prev.distanceKm - 0.1) {
                        direction = 'up'; // Moving towards Tunis
                    }
                    // If movement is < 0.1km, `direction` naturally keeps its value (prev.direction)
                }

                prevTrainsRef.current[train.train_id] = {
                    distanceKm: currentDistKm,
                    direction
                };

                return { ...train, direction };
            });
            // Update trains, merging old directions if the new fetch somehow missed it (though our ref covers it)
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
        if (!selectedArrival || trains.length === 0) return;

        let newNotifiedTrains = new Set(notifiedTrains);
        let updated = false;

        // Determine direction required again locally for the effect or use the trains array directly
        let localRequiredDirection = null;
        if (selectedStation && selectedArrival && selectedStation.id !== selectedArrival.id) {
            localRequiredDirection = selectedStation.id < selectedArrival.id ? 'down' : 'up';
        }

        const validTrains = trains.filter(t => t.direction === null || t.direction === localRequiredDirection);

        validTrains.forEach(train => {
            // Check ETA to Departure Station
            const trainDistKmForNotif = getTrainRouteDistance(parseFloat(train.latitude), parseFloat(train.longitude));
            const depDistanceDiff = Math.abs(trainDistKmForNotif - selectedStation.distanceKm);
            const etaToDeparture = getETA(depDistanceDiff);
            const depKey = `dep-${train.train_id}-${selectedStation.id}`;

            if (etaToDeparture <= 1 && !notifiedTrains.has(depKey)) {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Train à l'approche ! 🚆",
                        body: `Le train #${train.train_id} arrive à votre gare de départ dans environ 1 minute.`,
                        sound: true,
                    },
                    trigger: null,
                });

                Alert.alert(
                    "Train à l'approche ! 🚆",
                    `Le train #${train.train_id} arrive à votre gare de départ dans environ 1 minute.`
                );

                newNotifiedTrains.add(depKey);
                updated = true;
            }

            // Check ETA to Arrival Station
            // Logic Change: Only check Arrival ETA if the train has already passed the Departure station
            let hasPassedDeparture = false;

            if (localRequiredDirection === 'down') {
                hasPassedDeparture = trainDistKmForNotif >= selectedStation.distanceKm;
            } else if (localRequiredDirection === 'up') {
                hasPassedDeparture = trainDistKmForNotif <= selectedStation.distanceKm;
            }

            if (hasPassedDeparture) {
                const arrDistanceDiff = Math.abs(trainDistKmForNotif - selectedArrival.distanceKm);
                const etaToArrival = getETA(arrDistanceDiff);
                const arrKey = `arr-${train.train_id}-${selectedArrival.id}`;

                if (etaToArrival <= 1 && !notifiedTrains.has(arrKey)) {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Destination proche ! 🚆",
                            body: `Vous avez 1 minute pour arriver à votre destination.`,
                            sound: true,
                        },
                        trigger: null,
                    });

                    Alert.alert(
                        "Destination proche ! 🚆",
                        `Vous avez 1 minute pour arriver à votre destination.`
                    );

                    newNotifiedTrains.add(arrKey);
                    updated = true;
                }
            }
        });

        if (updated) {
            setNotifiedTrains(newNotifiedTrains);
        }
    }, [trains, selectedArrival, selectedStation, notifiedTrains]);

    if (loading && trains.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Connexion au réseau SNCFT...</Text>
            </View>
        );
    }

    // Determine the required direction to travel
    let requiredDirection = null;
    if (selectedStation && selectedArrival && selectedStation.id !== selectedArrival.id) {
        // Tunis Ville is id: 0, Erriadh is id: 15
        // If Departure < Arrival, we are moving South (down)
        // If Departure > Arrival, we are moving North (up)
        requiredDirection = selectedStation.id < selectedArrival.id ? 'down' : 'up';
    }

    // Filter trains to only show those heading in the correct direction,
    // or those whose direction is not yet known (null).
    const filteredTrains = trains.filter(train => {
        if (!selectedStation || !selectedArrival) return true; // Show all if no route selected
        if (train.direction === null) return true; // Keep stationary/newly-spawned trains
        return train.direction === requiredDirection;
    });

    // Calculate ETA specifically for the first filtered train
    let nextTrainETA = null;
    let hasTrainPassedDeparture = false;
    let dynamicDistanceKm = 0;
    let dynamicTravelTime = 0;

    if (selectedStation && selectedArrival) {
        // Base values (before boarding)
        dynamicDistanceKm = Math.abs(selectedStation.distanceKm - selectedArrival.distanceKm);
        dynamicTravelTime = calculateTravelTime(selectedStation, selectedArrival);

        if (filteredTrains.length > 0) {
            const activeTrain = filteredTrains[0];
            const activeTrainDistKm = getTrainRouteDistance(parseFloat(activeTrain.latitude), parseFloat(activeTrain.longitude));
            
            // Check if train is visually past the departure point
            if (requiredDirection === 'down') {
                hasTrainPassedDeparture = activeTrainDistKm >= selectedStation.distanceKm;
            } else if (requiredDirection === 'up') {
                hasTrainPassedDeparture = activeTrainDistKm <= selectedStation.distanceKm;
            }

            // ETA to the departure station for the dashboard banner
            // We only care about it if the train hasn't passed us yet!
            if (!hasTrainPassedDeparture) {
                const nextTrainDistanceDiff = Math.abs(activeTrainDistKm - selectedStation.distanceKm);
                nextTrainETA = getETA(nextTrainDistanceDiff);
            } else {
                nextTrainETA = 0; // The train is here or already left
                
                // If the train has boarded, update remaining rail distance and ETA to arrival
                dynamicDistanceKm = Math.abs(selectedArrival.distanceKm - activeTrainDistKm);
                
                if (dynamicDistanceKm > 0.1) {
                    dynamicTravelTime = getETA(dynamicDistanceKm);
                } else {
                    dynamicDistanceKm = 0;
                    dynamicTravelTime = 0; // Arrived
                }
            }
        }
    }

    return (
        <View style={styles.container}>
            {/* Header / Dashboard */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ligne Banlieue Sud</Text>
                <View style={styles.pickersContainerMain}>
                    <View style={[styles.pickerContainer, { flex: 1, marginRight: 5 }]}>
                        <Text style={styles.pickerLabel}>Gare de départ</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStation}
                                onValueChange={(itemValue) => setSelectedStation(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Départ..." value={null} />
                                {STATIONS.map((station, index) => (
                                    <Picker.Item key={index} label={station.name} value={station} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={[styles.pickerContainer, { flex: 1, marginLeft: 5 }]}>
                        <Text style={styles.pickerLabel}>Gare d'arrivée</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedArrival}
                                onValueChange={(itemValue) => setSelectedArrival(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Arrivée..." value={null} />
                                {STATIONS.map((station, index) => (
                                    <Picker.Item key={index} label={station.name} value={station} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                {selectedStation && selectedArrival && (
                    <View style={styles.etaBanner}>
                        {!hasTrainPassedDeparture ? (
                            <>
                                <Text style={styles.etaMainText}>
                                    {nextTrainETA !== null && nextTrainETA !== Infinity ? `Le train arrive dans ${nextTrainETA} min` : "Aucun train en mouvement"}
                                </Text>
                                <Text style={styles.etaSubText}>
                                    Trajet ({dynamicDistanceKm.toFixed(2)}km) : {dynamicTravelTime} min
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.etaMainText}>
                                    Reste : {dynamicDistanceKm.toFixed(2)}km ({dynamicTravelTime} min)
                                </Text>
                                <Text style={styles.etaSubText}>
                                    En route vers {selectedArrival.name}
                                </Text>
                            </>
                        )}
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
                        const isArrival = selectedArrival && selectedArrival.id === station.id;

                        return (
                            <View key={index} style={[styles.stationRow, { top: index * STATION_HEIGHT }]}>
                                <View style={[styles.stationDot, 
                                    isSelected && styles.selectedStationDot,
                                    isArrival && styles.arrivalStationDot
                                ]}>
                                    {(isSelected || isArrival) && <View style={styles.selectedStationInner} />}
                                </View>
                                <Text style={[styles.stationName, 
                                    isSelected && styles.selectedStationName,
                                    isArrival && styles.arrivalStationName
                                ]}>
                                    {station.name}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Moving Trains (Filtered) */}
                    {filteredTrains.map((train, index) => {
                        const trainDistKm = getTrainRouteDistance(parseFloat(train.latitude), parseFloat(train.longitude));
                        const pos = getTrainPosition(trainDistKm);
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
    pickersContainerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    pickerContainer: {
        // Removed generic bottom margin to rely on parent
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
    arrivalStationDot: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
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
    arrivalStationName: {
        color: '#065F46',
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
