import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

// ─── Real SNCFT Ramadan 2026 timetable ───────────────────────────────────────
// Source: ligne-a-ramadan-2026 official image
// Type A = trains going all the way to Borj Cédria
// Type B = short-run trains (Radès area only, — for further stops)

import { TUNIS_TO_BORJ, BORJ_TO_TUNIS } from '../utils/scheduleData';

const getNowMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const toMinutes = (t) => {
    if (!t || t === '—') return -1;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

// ─── Component ────────────────────────────────────────────────────────────────
const ScheduleScreen = ({ navigation }) => {
    const [dir, setDir] = useState('south');
    const { t } = useLanguage();

    const data = dir === 'south' ? TUNIS_TO_BORJ : BORJ_TO_TUNIS;
    const depKey = dir === 'south' ? 'tunis' : 'borj';
    const nowMin = getNowMinutes();

    // Find first upcoming train index
    let firstNextIdx = data.findIndex(row => {
        const t = row[depKey];
        return t !== '—' && toMinutes(t) > nowMin;
    });

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>🚆 {t('scheduleTitle')}</Text>
                <Text style={s.headerSub}>{t('scheduleSubtitle')}</Text>
            </View>

            {/* Toggle */}
            <View style={s.toggle}>
                <TouchableOpacity
                    style={[s.btn, dir === 'south' && s.btnActive]}
                    onPress={() => setDir('south')}
                >
                    <Text style={[s.btnTxt, dir === 'south' && s.btnTxtActive]}>{t('towardsBorj')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.btn, dir === 'north' && s.btnActive]}
                    onPress={() => setDir('north')}
                >
                    <Text style={[s.btnTxt, dir === 'north' && s.btnTxtActive]}>{t('towardsTunis')}</Text>
                </TouchableOpacity>
            </View>

            {/* Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                    {/* Header row */}
                    <View style={s.thRow}>
                        <Text style={[s.th, s.cN]}>N°</Text>
                        <Text style={[s.th, s.cT]}>T</Text>
                        {dir === 'south' ? (
                            <>
                                <Text style={[s.th, s.cTime]}>Tunis</Text>
                                <Text style={[s.th, s.cTime]}>Radès</Text>
                                <Text style={[s.th, s.cTime]}>Ezzahra</Text>
                                <Text style={[s.th, s.cTime]}>H. Lif</Text>
                                <Text style={[s.th, s.cTime]}>Borj C.</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[s.th, s.cTime]}>Borj C.</Text>
                                <Text style={[s.th, s.cTime]}>H. Lif</Text>
                                <Text style={[s.th, s.cTime]}>Ezzahra</Text>
                                <Text style={[s.th, s.cTime]}>Radès</Text>
                                <Text style={[s.th, s.cTime]}>Tunis</Text>
                            </>
                        )}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                        {data.map((row, i) => {
                            const isNext = i === firstNextIdx;
                            return (
                                <View key={i} style={[s.tdRow, i % 2 === 0 && s.even, isNext && s.nextRow]}>
                                    <Text style={[s.td, s.cN, isNext && s.nextTxt]}>{row.n}</Text>
                                    <Text style={[s.td, s.cT, row.t === 'A' ? s.typeA : s.typeB]}>{row.t}</Text>
                                    {dir === 'south' ? (
                                        <>
                                            <Text style={[s.td, s.cTime, isNext && s.nextTxt]}>{row.tunis}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.rades}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.ezzahra}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.hlif}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.borj}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[s.td, s.cTime, isNext && s.nextTxt]}>{row.borj}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.hlif}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.ezzahra}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.rades}</Text>
                                            <Text style={[s.td, s.cTime]}>{row.tunis}</Text>
                                        </>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Reservation */}
            <TouchableOpacity style={s.back} onPress={() => navigation.navigate('Reservation')}>
                <Text style={s.backTxt}>🎟️ {t('reservation')}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const s = StyleSheet.create({
    container:  { flex: 1, backgroundColor: '#F0F4FF' },
    header:     { backgroundColor: '#1E3A8A', padding: 18, alignItems: 'center', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
    headerTitle:{ fontSize: 19, fontWeight: 'bold', color: '#fff' },
    headerSub:  { fontSize: 12, color: '#BFDBFE', marginTop: 3 },
    toggle:     { flexDirection: 'row', margin: 12, gap: 8 },
    btn:        { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
    btnActive:  { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
    btnTxt:     { fontSize: 12, fontWeight: '600', color: '#475569' },
    btnTxtActive:{ color: '#fff' },
    thRow:      { flexDirection: 'row', backgroundColor: '#1E3A8A', paddingVertical: 9, paddingHorizontal: 6, marginHorizontal: 10, borderRadius: 8, marginBottom: 3 },
    th:         { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
    tdRow:      { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 6, marginHorizontal: 10, borderRadius: 6, marginBottom: 1 },
    even:       { backgroundColor: '#fff' },
    nextRow:    { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#1E3A8A' },
    td:         { fontSize: 12, color: '#1E293B', textAlign: 'center' },
    nextTxt:    { fontWeight: 'bold', color: '#1E3A8A' },
    cN:         { width: 44, fontWeight: '700' },
    cT:         { width: 22, fontWeight: '700' },
    cTime:      { width: 66 },
    typeA:      { color: '#1E3A8A' },
    typeB:      { color: '#DC2626' },
    back:       { backgroundColor: '#1E3A8A', margin: 14, padding: 13, borderRadius: 22, alignItems: 'center' },
    backTxt:    { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

export default ScheduleScreen;