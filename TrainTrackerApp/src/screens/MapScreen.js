import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView, Animated, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { fetchTrains } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import MapView, { Marker, Polyline } from 'react-native-maps';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

import { STATIONS, STATIONS_RAW, haversineKm } from '../utils/stationsData';

const STATION_HEIGHT = 100;

const MapScreen = () => {
    const [trains, setTrains] = React.useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState(null); // Departure
    const [selectedArrival, setSelectedArrival] = useState(null); // Arrival
    const [notifiedTrains, setNotifiedTrains] = useState(new Set());
    const [viewMode, setViewMode] = useState('schematic'); // 'schematic' | 'map'
    const mapRef = useRef(null);

    // Compute region to encompass the whole line
    const mapRegion = {
        latitude: 36.748,
        longitude: 10.296,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    // Store previous positions to calculate direction
    const prevTrainsRef = useRef({});

    const { t } = useLanguage();

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
            // Filter out trains that are currently stopped by an Admin
            const activeTrains = data.filter(t => !t.isStopped);
            
            const enhancedData = activeTrains.map(train => {
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

    useEffect(() => {
        if (viewMode === 'map' && mapRef.current && selectedStation && selectedArrival && selectedStation.id !== selectedArrival.id) {
            // Find all coordinates that are part of the trip to fit exactly
            const tripCoords = STATIONS.slice(
                Math.min(selectedStation.id, selectedArrival.id), 
                Math.max(selectedStation.id, selectedArrival.id) + 1
            ).map((s) => ({ latitude: s.latitude, longitude: s.longitude }));

            mapRef.current.fitToCoordinates(tripCoords, {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true,
            });
        }
    }, [selectedStation, selectedArrival, viewMode]);

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
        // Tunis Ville is id: 0, Erriadh is id: 18
        // If Departure < Arrival, we are moving South (down)
        // If Departure > Arrival, we are moving North (up)
        requiredDirection = selectedStation.id < selectedArrival.id ? 'down' : 'up';
    }

    // Filter trains to only show those heading in the correct direction,
    // or those whose direction is not yet known (null).
    const filteredTrains = trains.filter(train => {
        if (!selectedStation || !selectedArrival) return true; 
        if (train.direction === null) return true; 
        if (train.direction === requiredDirection) return true;
        
        // Exceptional case: Waiting at the terminus.
        // If at Tunis (0) wanting to go Down, the incoming train is coming Up.
        if (selectedStation.id === 0 && requiredDirection === 'down' && train.direction === 'up') {
            return true;
        }
        // If at Erriadh (18) wanting to go Up, the incoming train is coming Down.
        if (selectedStation.id === 18 && requiredDirection === 'up' && train.direction === 'down') {
            return true;
        }

        return false;
    });

    // Calculate ETA specifically for the first filtered train
    let nextTrainETA = null;
    let hasTrainPassedDeparture = false;
    let hasPassedArrival = false;
    let dynamicDistanceKm = 0;
    let dynamicTravelTime = 0;
    let distanceToDeparture = 0;

    if (selectedStation && selectedArrival) {
        // Base values (before boarding)
        dynamicDistanceKm = Math.abs(selectedStation.distanceKm - selectedArrival.distanceKm);
        dynamicTravelTime = calculateTravelTime(selectedStation, selectedArrival);

        if (filteredTrains.length > 0) {
            const activeTrain = filteredTrains[0];
            const activeTrainDistKm = getTrainRouteDistance(parseFloat(activeTrain.latitude), parseFloat(activeTrain.longitude));
            
            let trainActualDirection = activeTrain.direction || requiredDirection;

            if (trainActualDirection === requiredDirection) {
                // Train is moving in the same direction we want
                if (requiredDirection === 'down') {
                    hasTrainPassedDeparture = activeTrainDistKm >= (selectedStation.distanceKm - 0.1);
                    hasPassedArrival = activeTrainDistKm >= (selectedArrival.distanceKm - 0.1);
                } else if (requiredDirection === 'up') {
                    hasTrainPassedDeparture = activeTrainDistKm <= (selectedStation.distanceKm + 0.1);
                    hasPassedArrival = activeTrainDistKm <= (selectedArrival.distanceKm + 0.1);
                }
            } else {
                // Train is moving OPPOSITE to where we want to go.
                // This happens when we wait at Tunis/Erriadh for the train to finish its previous trip.
                hasTrainPassedDeparture = false; // It hasn't arrived at the departure yet
                hasPassedArrival = false;
            }

            // ETA to the departure station for the dashboard banner
            if (!hasTrainPassedDeparture) {
                distanceToDeparture = Math.abs(activeTrainDistKm - selectedStation.distanceKm);
                nextTrainETA = getETA(distanceToDeparture);
            } else {
                nextTrainETA = 0; // The train is here or already left
                distanceToDeparture = 0;
                
                if (hasPassedArrival) {
                    // Train reached or passed destination
                    dynamicDistanceKm = 0;
                    dynamicTravelTime = 0;
                } else {
                    // Train is between Departure and Arrival
                    dynamicDistanceKm = Math.abs(selectedArrival.distanceKm - activeTrainDistKm);
                    dynamicTravelTime = getETA(dynamicDistanceKm);
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
                        <Text style={styles.pickerLabel}>{t('departure')}</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStation}
                                onValueChange={(itemValue) => setSelectedStation(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label={`${t('departure')}...`} value={null} />
                                {STATIONS.map((station, index) => (
                                    <Picker.Item key={index} label={station.name} value={station} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={[styles.pickerContainer, { flex: 1, marginLeft: 5 }]}>
                        <Text style={styles.pickerLabel}>{t('arrival')}</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedArrival}
                                onValueChange={(itemValue) => setSelectedArrival(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label={`${t('arrival')}...`} value={null} />
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
                                    {nextTrainETA !== null && nextTrainETA !== Infinity
                                        ? `Le train arrive à ${selectedStation.name} dans ${nextTrainETA} min`
                                        : t('noTrain')}
                                </Text>
                                <Text style={styles.etaSubText}>
                                    Distance vers la gare de départ : {distanceToDeparture.toFixed(2)} km
                                </Text>
                            </>
                        ) : !hasPassedArrival ? (
                            <>
                                <Text style={styles.etaMainText}>
                                    🚆 Le train arrive à {selectedArrival.name} dans {dynamicTravelTime} min
                                </Text>
                                <Text style={styles.etaSubText}>
                                    Distance restante vers votre destination : {dynamicDistanceKm.toFixed(2)} km
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.etaMainText}>
                                    {t('arrived')} ✔️ {t('trainAt')} {selectedArrival.name}
                                </Text>
                                <Text style={styles.etaSubText}>
                                    Voyage terminé
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {/* View Mode Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'schematic' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('schematic')}
                    >
                        <Text style={[styles.toggleBtnText, viewMode === 'schematic' && styles.toggleBtnTextActive]}>Schéma de Ligne</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('map')}
                    >
                        <Text style={[styles.toggleBtnText, viewMode === 'map' && styles.toggleBtnTextActive]}>Carte Réelle</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Switcher */}
            {viewMode === 'schematic' ? (
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
            ) : (
                <MapView 
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={mapRegion}
                    minZoomLevel={11} // Prevents seeing the whole globe
                    onMapReady={() => {
                        if (mapRef.current) {
                            // Strictly trap the camera panning within the Tunis <-> Borj Cedria corridor
                            mapRef.current.setMapBoundaries(
                                { latitude: 36.820, longitude: 10.430 }, // NorthEast corner
                                { latitude: 36.680, longitude: 10.160 }  // SouthWest corner
                            );
                        }
                    }}
                >
                    {/* Background line for the entire track: Now BLUE */}
                    <Polyline 
                        coordinates={STATIONS.map((s) => ({ latitude: s.latitude, longitude: s.longitude }))}
                        strokeColor="#3B82F6" // Standard blue for the track
                        strokeWidth={8}       // THICKER (gras)
                    />

                    {/* Green line for the selected trip */}
                    {selectedStation && selectedArrival && (
                        <Polyline 
                            coordinates={STATIONS.slice(
                                Math.min(selectedStation.id, selectedArrival.id), 
                                Math.max(selectedStation.id, selectedArrival.id) + 1
                            ).map((s) => ({ latitude: s.latitude, longitude: s.longitude }))}
                            strokeColor="#10B981" // Bright green for the trip
                            strokeWidth={12}      // THICKER (gras)
                            zIndex={10}
                        />
                    )}

                    {/* Only render markers for Departure and Arrival */}
                    {selectedStation && (
                        <Marker 
                            coordinate={{ latitude: selectedStation.latitude, longitude: selectedStation.longitude }}
                            title={selectedStation.name}
                            pinColor="#F59E0B"
                            zIndex={20}
                        />
                    )}
                    {selectedArrival && selectedArrival.id !== selectedStation?.id && (
                        <Marker 
                            coordinate={{ latitude: selectedArrival.latitude, longitude: selectedArrival.longitude }}
                            title={selectedArrival.name}
                            pinColor="#10B981"
                            zIndex={20}
                        />
                    )}

                    {filteredTrains.map((train, index) => {
                        let arrow = '';
                        if (train.direction === 'down') arrow = '⬇️';
                        else if (train.direction === 'up') arrow = '⬆️';

                        return (
                            <Marker
                                key={`map-train-${index}`}
                                coordinate={{ latitude: parseFloat(train.latitude), longitude: parseFloat(train.longitude) }}
                                title={`Train #${train.train_id} ${arrow}`}
                                description={`${train.speed} km/h`}
                                zIndex={100}
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={styles.mapTrainMarker}>
                                    <Text style={{ fontSize: 20 }}>🚆</Text>
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>
            )}
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
    },
    toggleContainer: {
        flexDirection: 'row',
        marginTop: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    toggleBtnActive: {
        backgroundColor: '#1E3A8A',
    },
    toggleBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    toggleBtnTextActive: {
        color: '#FFFFFF',
    },
    map: {
        flex: 1,
        width: '100%',
    },
    mapTrainMarker: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 2,
        borderColor: '#1E3A8A',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
});

export default MapScreen;
