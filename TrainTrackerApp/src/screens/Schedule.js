import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView
} from 'react-native';

const ScheduleScreen = ({ navigation }) => {
    const [selectedDirection, setSelectedDirection] = useState('tunisToRades'); // 'tunisToRades' or 'radesToTunis'

    // Schedule data from the image
    const scheduleData = [
        { id: 'A', trainNum: '101', tunisTime: '5:10', returnId: 'S1', radesTime: '5:24', arrivalTime: '5:26' },
        { id: 'B', trainNum: '103', tunisTime: '5:30', returnId: 'S1', radesTime: '5:44', arrivalTime: '5:46' },
        { id: 'C', trainNum: '105', tunisTime: '5:40', returnId: 'S1', radesTime: '5:54', arrivalTime: '5:56' },
        { id: 'D', trainNum: '107', tunisTime: '6:00', returnId: 'S1', radesTime: '6:14', arrivalTime: '6:16' },
        { id: 'E', trainNum: '109', tunisTime: '6:20', returnId: 'S1', radesTime: '6:34', arrivalTime: '6:36' },
        { id: 'F', trainNum: '111', tunisTime: '6:30', returnId: 'S1', radesTime: '6:44', arrivalTime: '6:46' },
        { id: 'G', trainNum: '113', tunisTime: '6:45', returnId: 'S1', radesTime: '6:58', arrivalTime: '7:00' },
        { id: 'H', trainNum: '115', tunisTime: '7:00', returnId: 'T1', radesTime: '7:13', arrivalTime: '7:15' },
        { id: 'I', trainNum: '117', tunisTime: '7:05', returnId: 'T1', radesTime: '7:23', arrivalTime: '7:25' },
        { id: 'J', trainNum: '119', tunisTime: '7:10', returnId: 'T2', radesTime: '7:33', arrivalTime: '7:35' },
        { id: 'K', trainNum: '121', tunisTime: '7:39', returnId: 'T3', radesTime: '7:42', arrivalTime: '7:44' },
        { id: 'L', trainNum: '127', tunisTime: '7:50', returnId: 'U1', radesTime: '8:03', arrivalTime: '8:05' },
        { id: 'M', trainNum: '131', tunisTime: '8:10', returnId: 'U2', radesTime: '8:23', arrivalTime: '8:25' },
        { id: 'N', trainNum: '133', tunisTime: '8:30', returnId: 'U3', radesTime: '8:42', arrivalTime: '8:44' },
        { id: 'O', trainNum: '135', tunisTime: '9:00', returnId: 'V1', radesTime: '9:13', arrivalTime: '9:15' },
        { id: 'P', trainNum: '137', tunisTime: '9:19', returnId: 'V2', radesTime: '9:27', arrivalTime: '9:29' },
        { id: 'Q', trainNum: '139', tunisTime: '9:30', returnId: 'W1', radesTime: '9:42', arrivalTime: '9:44' },
        { id: 'R', trainNum: '141', tunisTime: '10:00', returnId: 'X1', radesTime: '10:13', arrivalTime: '10:15' },
        { id: 'S', trainNum: '143', tunisTime: '10:30', returnId: 'Y1', radesTime: '10:43', arrivalTime: '10:45' },
        { id: 'T', trainNum: '145', tunisTime: '11:00', returnId: 'Z1', radesTime: '11:13', arrivalTime: '11:15' },
        { id: 'U', trainNum: '147', tunisTime: '11:44', returnId: 'AA1', radesTime: '11:55', arrivalTime: '12:00' },
        { id: 'V', trainNum: '149', tunisTime: '12:00', returnId: 'BB1', radesTime: '12:13', arrivalTime: '12:15' },
        { id: 'W', trainNum: '151', tunisTime: '12:44', returnId: 'CC1', radesTime: '12:55', arrivalTime: '13:00' },
        { id: 'X', trainNum: '153', tunisTime: '13:30', returnId: 'DD1', radesTime: '13:53', arrivalTime: '14:00' },
        { id: 'Y', trainNum: '155', tunisTime: '14:00', returnId: 'EE1', radesTime: '14:13', arrivalTime: '14:15' },
        { id: 'Z', trainNum: '157', tunisTime: '14:44', returnId: 'FF1', radesTime: '14:55', arrivalTime: '15:00' },
        { id: 'AA', trainNum: '159', tunisTime: '15:00', returnId: 'GG1', radesTime: '15:13', arrivalTime: '15:15' },
        { id: 'AB', trainNum: '161', tunisTime: '15:44', returnId: 'HH1', radesTime: '15:55', arrivalTime: '16:00' },
        { id: 'AC', trainNum: '163', tunisTime: '16:00', returnId: 'II1', radesTime: '16:13', arrivalTime: '16:15' },
        { id: 'AD', trainNum: '165', tunisTime: '16:44', returnId: 'JJ1', radesTime: '16:55', arrivalTime: '17:00' },
        { id: 'AE', trainNum: '167', tunisTime: '17:44', returnId: 'KK1', radesTime: '17:55', arrivalTime: '18:00' },
        { id: 'AF', trainNum: '169', tunisTime: '18:00', returnId: 'LL1', radesTime: '18:13', arrivalTime: '18:15' },
        { id: 'AG', trainNum: '171', tunisTime: '18:44', returnId: 'MM1', radesTime: '18:55', arrivalTime: '19:00' },
        { id: 'AH', trainNum: '173', tunisTime: '19:00', returnId: 'NN1', radesTime: '19:13', arrivalTime: '19:15' },
        { id: 'AI', trainNum: '175', tunisTime: '19:44', returnId: 'PP1', radesTime: '19:55', arrivalTime: '20:00' },
        { id: 'AJ', trainNum: '177', tunisTime: '20:00', returnId: 'QQ1', radesTime: '20:13', arrivalTime: '20:15' },
        { id: 'AK', trainNum: '179', tunisTime: '20:44', returnId: 'RR1', radesTime: '20:55', arrivalTime: '21:00' },
        { id: 'AL', trainNum: '181', tunisTime: '21:00', returnId: 'SS1', radesTime: '21:13', arrivalTime: '21:15' },
        { id: 'AM', trainNum: '183', tunisTime: '21:44', returnId: 'TT1', radesTime: '21:55', arrivalTime: '22:00' },
        { id: 'AN', trainNum: '185', tunisTime: '22:00', returnId: 'UU1', radesTime: '22:13', arrivalTime: '22:15' },
        { id: 'AO', trainNum: '187', tunisTime: '22:44', returnId: 'VV1', radesTime: '22:55', arrivalTime: '23:00' },
        { id: 'AP', trainNum: '189', tunisTime: '23:00', returnId: 'WW1', radesTime: '23:13', arrivalTime: '23:15' },
        { id: 'AQ', trainNum: '191', tunisTime: '23:44', returnId: 'XX1', radesTime: '23:55', arrivalTime: '0:00' },
        { id: 'AR', trainNum: '193', tunisTime: '0:00', returnId: 'YY1', radesTime: '0:13', arrivalTime: '0:15' },
        { id: 'AS', trainNum: '195', tunisTime: '0:44', returnId: 'ZZ1', radesTime: '0:55', arrivalTime: '1:00' },
        { id: 'AT', trainNum: '197', tunisTime: '1:00', returnId: 'AA1', radesTime: '1:13', arrivalTime: '1:15' },
    ];

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const isNextTrain = (time) => {
        const current = getCurrentTime();
        const [currentHour, currentMinute] = current.split(':').map(Number);
        const [trainHour, trainMinute] = time.split(':').map(Number);

        if (trainHour > currentHour) return true;
        if (trainHour === currentHour && trainMinute > currentMinute) return true;
        return false;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Year and Arabic Title */}
            <View style={styles.header}>
                <Text style={styles.yearText}>2026</Text>
                <Text style={styles.arabicTitle}>الرابط الرئيسي</Text>
                <Text style={styles.subtitle}>Banlieue Sud - Tunis Ville ↔ Rades</Text>
            </View>

            {/* Direction Toggle */}
            <View style={styles.directionToggle}>
                <TouchableOpacity
                    style={[
                        styles.directionButton,
                        selectedDirection === 'tunisToRades' && styles.directionButtonActive
                    ]}
                    onPress={() => setSelectedDirection('tunisToRades')}
                >
                    <Text style={[
                        styles.directionButtonText,
                        selectedDirection === 'tunisToRades' && styles.directionButtonTextActive
                    ]}>TUNIS VILLE → Rades</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.directionButton,
                        selectedDirection === 'radesToTunis' && styles.directionButtonActive
                    ]}
                    onPress={() => setSelectedDirection('radesToTunis')}
                >
                    <Text style={[
                        styles.directionButtonText,
                        selectedDirection === 'radesToTunis' && styles.directionButtonTextActive
                    ]}>Rades → TUNIS VILLE</Text>
                </TouchableOpacity>
            </View>

            {/* Schedule Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        {selectedDirection === 'tunisToRades' ? (
                            <>
                                <Text style={[styles.headerCell, styles.trainCodeCell]}>Train</Text>
                                <Text style={[styles.headerCell, styles.trainNumCell]}>N°</Text>
                                <Text style={[styles.headerCell, styles.timeCell]}>Départ</Text>
                                <Text style={[styles.headerCell, styles.stationCell]}>Destination</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.headerCell, styles.trainCodeCell]}>Train</Text>
                                <Text style={[styles.headerCell, styles.timeCell]}>Départ</Text>
                                <Text style={[styles.headerCell, styles.timeCell]}>Arrivée</Text>
                                <Text style={[styles.headerCell, styles.stationCell]}>Destination</Text>
                            </>
                        )}
                    </View>

                    {/* Table Rows */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {scheduleData.map((train, index) => {
                            const isNext = isNextTrain(selectedDirection === 'tunisToRades' ? train.tunisTime : train.radesTime);

                            return (
                                <View key={index} style={[
                                    styles.tableRow,
                                    isNext && styles.nextTrainRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                                ]}>
                                    {selectedDirection === 'tunisToRades' ? (
                                        <>
                                            <Text style={[styles.cell, styles.trainCodeCell, isNext && styles.nextTrainText]}>
                                                {train.id}
                                            </Text>
                                            <Text style={[styles.cell, styles.trainNumCell, isNext && styles.nextTrainText]}>
                                                {train.trainNum}
                                            </Text>
                                            <Text style={[styles.cell, styles.timeCell, isNext && styles.nextTrainText]}>
                                                {train.tunisTime}
                                            </Text>
                                            <Text style={[styles.cell, styles.stationCell, isNext && styles.nextTrainText]}>
                                                Rades {train.returnId}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[styles.cell, styles.trainCodeCell, isNext && styles.nextTrainText]}>
                                                {train.returnId}
                                            </Text>
                                            <Text style={[styles.cell, styles.timeCell, isNext && styles.nextTrainText]}>
                                                {train.radesTime}
                                            </Text>
                                            <Text style={[styles.cell, styles.timeCell, isNext && styles.nextTrainText]}>
                                                {train.arrivalTime}
                                            </Text>
                                            <Text style={[styles.cell, styles.stationCell, isNext && styles.nextTrainText]}>
                                                Tunis Ville
                                            </Text>
                                        </>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#1E3A8A',
        padding: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    yearText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    arabicTitle: {
        fontSize: 24,
        color: '#E0E7FF',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#BFDBFE',
    },
    directionToggle: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    directionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    directionButtonActive: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    directionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    directionButtonTextActive: {
        color: '#FFFFFF',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E3A8A',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    headerCell: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        borderRadius: 8,
        marginVertical: 2,
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F8FAFC',
    },
    nextTrainRow: {
        backgroundColor: '#E6F0FF',
        borderWidth: 1,
        borderColor: '#1E3A8A',
    },
    cell: {
        fontSize: 14,
        color: '#1E293B',
        textAlign: 'center',
    },
    nextTrainText: {
        fontWeight: 'bold',
        color: '#1E3A8A',
    },
    trainCodeCell: {
        width: 70,
        fontWeight: '600',
    },
    trainNumCell: {
        width: 70,
    },
    timeCell: {
        width: 80,
    },
    stationCell: {
        width: 120,
    },
    backButton: {
        backgroundColor: '#1E3A8A',
        margin: 20,
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ScheduleScreen;