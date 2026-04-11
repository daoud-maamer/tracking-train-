import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../context/LanguageContext';
import { STATIONS } from '../utils/stationsData';
import { TUNIS_TO_BORJ, BORJ_TO_TUNIS } from '../utils/scheduleData';

const ReservationScreen = () => {
    const { t } = useLanguage();
    const [departure, setDeparture] = useState(null);
    const [arrival, setArrival] = useState(null);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [availableTrains, setAvailableTrains] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (departure && arrival && departure.id !== arrival.id) {
            const dir = departure.id < arrival.id ? 'south' : 'north';
            const schedule = dir === 'south' ? TUNIS_TO_BORJ : BORJ_TO_TUNIS;
            
            const depKey = dir === 'south'
                ? (departure.id < 7 ? 'tunis' : departure.id < 9 ? 'rades' : departure.id < 12 ? 'ezzahra' : departure.id < 17 ? 'hlif' : 'borj')
                : (departure.id > 16 ? 'borj' : departure.id > 11 ? 'hlif' : departure.id > 8 ? 'ezzahra' : departure.id > 6 ? 'rades' : 'tunis');
                
            const arrKey = dir === 'south'
                ? (arrival.id < 7 ? 'tunis' : arrival.id < 9 ? 'rades' : arrival.id < 12 ? 'ezzahra' : arrival.id < 17 ? 'hlif' : 'borj')
                : (arrival.id > 16 ? 'borj' : arrival.id > 11 ? 'hlif' : arrival.id > 8 ? 'ezzahra' : arrival.id > 6 ? 'rades' : 'tunis');

            const validTrains = schedule.filter(t => t[depKey] !== '—' && t[arrKey] !== '—').map(t => ({
                id: t.n,
                label: `Train N°${t.n} — Départ vers ${t[depKey]}`,
                time: t[depKey]
            }));

            setAvailableTrains(validTrains);
            setSelectedTrain(null);
        } else {
            setAvailableTrains([]);
            setSelectedTrain(null);
        }
    }, [departure, arrival]);


    const handleSearch = () => {
        if (!departure || !arrival) {
            Alert.alert('Erreur', 'Veuillez sélectionner le départ et l\'arrivée.');
            return;
        }
        if (departure.id === arrival.id) {
            Alert.alert('Erreur', 'Le départ et l\'arrivée doivent être différents.');
            return;
        }
        if (!selectedTrain) {
            Alert.alert('Erreur', 'Veuillez sélectionner un horaire.');
            return;
        }

        const distanceStationCount = Math.abs(departure.id - arrival.id);
        const cost = distanceStationCount * 0.5;

        setResult({
            cost: cost.toFixed(3),
            nextTrain: selectedTrain.time,
            trainId: selectedTrain.id
        });
    };

    const handleBook = () => {
        Alert.alert('Succès', t('bookingSuccess'));
        setDeparture(null);
        setArrival(null);
        setSelectedTrain(null);
        setResult(null);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>🎟️ {t('reservation')}</Text>
                
                <Text style={styles.label}>{t('departure')}</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={departure}
                        onValueChange={(val) => setDeparture(val)}
                        style={styles.picker}
                    >
                        <Picker.Item label={`${t('departure')}...`} value={null} />
                        {STATIONS.map((station, index) => (
                            <Picker.Item key={`dep-${index}`} label={station.name} value={station} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>{t('arrival')}</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={arrival}
                        onValueChange={(val) => setArrival(val)}
                        style={styles.picker}
                    >
                        <Picker.Item label={`${t('arrival')}...`} value={null} />
                        {STATIONS.map((station, index) => (
                            <Picker.Item key={`arr-${index}`} label={station.name} value={station} />
                        ))}
                    </Picker>
                </View>

                {availableTrains.length > 0 && (
                    <>
                        <Text style={styles.label}>Horaire de train</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedTrain}
                                onValueChange={(val) => setSelectedTrain(val)}
                                style={styles.picker}
                            >
                                <Picker.Item label={`Sélectionnez un horaire...`} value={null} />
                                {availableTrains.map((train, index) => (
                                    <Picker.Item key={`train-${index}`} label={train.label} value={train} />
                                ))}
                            </Picker>
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>🔍 {t('searchTrain')}</Text>
                </TouchableOpacity>
            </View>

            {result && (
                <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>🚆 {t('nextTrainLabel')}</Text>
                        <Text style={styles.resultValueHighlight}>{result.nextTrain} (N°{result.trainId})</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>💳 {t('ticketCost')}</Text>
                        <Text style={styles.resultValueHighlight}>{result.cost} {t('dt')}</Text>
                    </View>

                    <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
                        <Text style={styles.bookButtonText}>{t('bookTicket')} ✔️</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F9FAFB',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    pickerWrapper: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    picker: {
        height: 50,
    },
    searchButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 10,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 6,
        borderLeftColor: '#10B981',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultLabel: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
    },
    resultValueHighlight: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E3A8A',
    },
    bookButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ReservationScreen;
