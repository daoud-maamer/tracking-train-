import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';

// ─── Real SNCFT Ramadan 2026 timetable ───────────────────────────────────────
// Source: ligne-a-ramadan-2026 official image
// Type A = trains going all the way to Borj Cédria
// Type B = short-run trains (Radès area only, — for further stops)

const TUNIS_TO_BORJ = [
    { n: '101', t: 'A', tunis: '5:20', rades: '5:38', ezzahra: '5:49', hlif: '5:58',  borj: '6:09'  },
    { n: '103', t: 'B', tunis: '5:30', rades: '5:41', ezzahra: '5:52', hlif: '—',     borj: '—'     },
    { n: '105', t: 'A', tunis: '5:36', rades: '5:46', ezzahra: '5:58', hlif: '6:06',  borj: '6:17'  },
    { n: '107', t: 'B', tunis: '5:45', rades: '5:56', ezzahra: '6:07', hlif: '—',     borj: '—'     },
    { n: '109', t: 'A', tunis: '6:20', rades: '6:31', ezzahra: '6:43', hlif: '6:52',  borj: '7:04'  },
    { n: '113', t: 'A', tunis: '6:35', rades: '6:47', ezzahra: '6:59', hlif: '7:08',  borj: '7:19'  },
    { n: '115', t: 'B', tunis: '7:00', rades: '7:10', ezzahra: '7:21', hlif: '—',     borj: '—'     },
    { n: '117', t: 'A', tunis: '7:05', rades: '7:15', ezzahra: '7:27', hlif: '7:36',  borj: '7:47'  },
    { n: '119', t: 'B', tunis: '7:10', rades: '7:21', ezzahra: '7:32', hlif: '—',     borj: '—'     },
    { n: '121', t: 'A', tunis: '7:30', rades: '7:42', ezzahra: '7:53', hlif: '8:02',  borj: '8:13'  },
    { n: '125', t: 'B', tunis: '7:50', rades: '8:01', ezzahra: '8:12', hlif: '—',     borj: '—'     },
    { n: '127', t: 'A', tunis: '8:00', rades: '8:10', ezzahra: '8:21', hlif: '8:30',  borj: '8:41'  },
    { n: '131', t: 'B', tunis: '8:30', rades: '8:41', ezzahra: '8:52', hlif: '—',     borj: '—'     },
    { n: '133', t: 'A', tunis: '8:50', rades: '9:01', ezzahra: '9:12', hlif: '9:21',  borj: '9:32'  },
    { n: '137', t: 'A', tunis: '9:15', rades: '9:27', ezzahra: '9:38', hlif: '9:47',  borj: '9:57'  },
    { n: '139', t: 'B', tunis: '9:30', rades: '9:41', ezzahra: '9:52', hlif: '—',     borj: '—'     },
    { n: '141', t: 'A', tunis: '10:00', rades: '10:12', ezzahra: '10:23', hlif: '10:32', borj: '10:43' },
    { n: '143', t: 'B', tunis: '10:30', rades: '10:42', ezzahra: '10:53', hlif: '—',     borj: '—'     },
    { n: '145', t: 'A', tunis: '11:00', rades: '11:12', ezzahra: '11:23', hlif: '11:32', borj: '11:43' },
    { n: '147', t: 'B', tunis: '11:30', rades: '11:42', ezzahra: '11:53', hlif: '—',     borj: '—'     },
    { n: '149', t: 'A', tunis: '12:00', rades: '12:12', ezzahra: '12:23', hlif: '12:32', borj: '12:43' },
    { n: '153', t: 'A', tunis: '13:00', rades: '13:12', ezzahra: '13:23', hlif: '13:32', borj: '13:43' },
    { n: '155', t: 'B', tunis: '13:30', rades: '13:41', ezzahra: '13:52', hlif: '—',     borj: '—'     },
    { n: '157', t: 'A', tunis: '14:00', rades: '14:12', ezzahra: '14:23', hlif: '14:32', borj: '14:43' },
    { n: '159', t: 'B', tunis: '14:30', rades: '14:41', ezzahra: '14:52', hlif: '—',     borj: '—'     },
    { n: '161', t: 'A', tunis: '15:00', rades: '15:12', ezzahra: '15:23', hlif: '15:32', borj: '15:43' },
    { n: '163', t: 'B', tunis: '15:30', rades: '15:41', ezzahra: '15:52', hlif: '—',     borj: '—'     },
    { n: '165', t: 'A', tunis: '16:00', rades: '16:12', ezzahra: '16:23', hlif: '16:32', borj: '16:43' },
    { n: '167', t: 'B', tunis: '16:30', rades: '16:41', ezzahra: '16:52', hlif: '—',     borj: '—'     },
    { n: '169', t: 'A', tunis: '17:00', rades: '17:12', ezzahra: '17:23', hlif: '17:32', borj: '17:43' },
    { n: '171', t: 'B', tunis: '17:30', rades: '17:41', ezzahra: '17:52', hlif: '—',     borj: '—'     },
    { n: '173', t: 'A', tunis: '18:00', rades: '18:12', ezzahra: '18:23', hlif: '18:32', borj: '18:43' },
    { n: '175', t: 'B', tunis: '18:30', rades: '18:41', ezzahra: '18:52', hlif: '—',     borj: '—'     },
    { n: '177', t: 'A', tunis: '19:00', rades: '19:12', ezzahra: '19:23', hlif: '19:32', borj: '19:43' },
    { n: '179', t: 'B', tunis: '19:30', rades: '19:41', ezzahra: '19:52', hlif: '—',     borj: '—'     },
    { n: '181', t: 'A', tunis: '20:00', rades: '20:12', ezzahra: '20:23', hlif: '20:32', borj: '20:43' },
    { n: '185', t: 'A', tunis: '21:00', rades: '21:12', ezzahra: '21:23', hlif: '21:32', borj: '21:43' },
    { n: '189', t: 'A', tunis: '22:00', rades: '22:12', ezzahra: '22:23', hlif: '22:32', borj: '22:43' },
    { n: '193', t: 'A', tunis: '23:00', rades: '23:12', ezzahra: '23:23', hlif: '23:32', borj: '23:43' },
    { n: '195', t: 'A', tunis: '23:45', rades: '23:57', ezzahra: '0:09',  hlif: '0:18',  borj: '0:28'  },
];

const BORJ_TO_TUNIS = [
    { n: '102', t: 'A', borj: '5:00',  hlif: '5:11',  ezzahra: '5:20',  rades: '5:32',  tunis: '5:41'  },
    { n: '104', t: 'B', borj: '—',     hlif: '5:40',  ezzahra: '5:44',  rades: '5:54',  tunis: '6:05'  },
    { n: '106', t: 'A', borj: '5:46',  hlif: '5:57',  ezzahra: '6:06',  rades: '6:17',  tunis: '6:27'  },
    { n: '108', t: 'B', borj: '—',     hlif: '6:06',  ezzahra: '6:09',  rades: '6:19',  tunis: '6:30'  },
    { n: '110', t: 'A', borj: '6:00',  hlif: '6:11',  ezzahra: '6:20',  rades: '6:32',  tunis: '6:42'  },
    { n: '114', t: 'B', borj: '—',     hlif: '6:40',  ezzahra: '6:44',  rades: '6:54',  tunis: '7:05'  },
    { n: '116', t: 'A', borj: '6:48',  hlif: '6:59',  ezzahra: '7:09',  rades: '7:21',  tunis: '7:31'  },
    { n: '118', t: 'B', borj: '—',     hlif: '7:07',  ezzahra: '7:11',  rades: '7:22',  tunis: '7:33'  },
    { n: '120', t: 'A', borj: '7:10',  hlif: '7:21',  ezzahra: '7:31',  rades: '7:43',  tunis: '7:53'  },
    { n: '122', t: 'B', borj: '—',     hlif: '7:35',  ezzahra: '7:38',  rades: '7:49',  tunis: '8:00'  },
    { n: '126', t: 'A', borj: '7:50',  hlif: '8:01',  ezzahra: '8:11',  rades: '8:23',  tunis: '8:33'  },
    { n: '128', t: 'B', borj: '—',     hlif: '8:10',  ezzahra: '8:14',  rades: '8:24',  tunis: '8:35'  },
    { n: '132', t: 'A', borj: '8:30',  hlif: '8:41',  ezzahra: '8:51',  rades: '9:03',  tunis: '9:13'  },
    { n: '134', t: 'B', borj: '—',     hlif: '9:05',  ezzahra: '9:09',  rades: '9:20',  tunis: '9:30'  },
    { n: '136', t: 'A', borj: '9:00',  hlif: '9:11',  ezzahra: '9:21',  rades: '9:33',  tunis: '9:43'  },
    { n: '138', t: 'B', borj: '—',     hlif: '9:40',  ezzahra: '9:44',  rades: '9:55',  tunis: '10:06' },
    { n: '140', t: 'A', borj: '9:45',  hlif: '9:56',  ezzahra: '10:06', rades: '10:18', tunis: '10:28' },
    { n: '142', t: 'B', borj: '—',     hlif: '10:10', ezzahra: '10:14', rades: '10:25', tunis: '10:36' },
    { n: '144', t: 'A', borj: '10:30', hlif: '10:41', ezzahra: '10:51', rades: '11:03', tunis: '11:13' },
    { n: '146', t: 'B', borj: '—',     hlif: '11:10', ezzahra: '11:14', rades: '11:25', tunis: '11:36' },
    { n: '148', t: 'A', borj: '11:30', hlif: '11:41', ezzahra: '11:51', rades: '12:03', tunis: '12:13' },
    { n: '150', t: 'B', borj: '—',     hlif: '12:10', ezzahra: '12:14', rades: '12:25', tunis: '12:36' },
    { n: '152', t: 'A', borj: '12:30', hlif: '12:41', ezzahra: '12:51', rades: '13:03', tunis: '13:13' },
    { n: '154', t: 'A', borj: '13:30', hlif: '13:41', ezzahra: '13:51', rades: '14:03', tunis: '14:13' },
    { n: '156', t: 'B', borj: '—',     hlif: '14:10', ezzahra: '14:14', rades: '14:25', tunis: '14:36' },
    { n: '158', t: 'A', borj: '14:30', hlif: '14:41', ezzahra: '14:51', rades: '15:03', tunis: '15:13' },
    { n: '160', t: 'B', borj: '—',     hlif: '15:10', ezzahra: '15:14', rades: '15:25', tunis: '15:36' },
    { n: '162', t: 'A', borj: '15:30', hlif: '15:41', ezzahra: '15:51', rades: '16:03', tunis: '16:13' },
    { n: '164', t: 'B', borj: '—',     hlif: '16:10', ezzahra: '16:14', rades: '16:25', tunis: '16:36' },
    { n: '166', t: 'A', borj: '16:30', hlif: '16:41', ezzahra: '16:51', rades: '17:03', tunis: '17:13' },
    { n: '168', t: 'B', borj: '—',     hlif: '17:10', ezzahra: '17:14', rades: '17:25', tunis: '17:36' },
    { n: '170', t: 'A', borj: '17:30', hlif: '17:41', ezzahra: '17:51', rades: '18:03', tunis: '18:13' },
    { n: '172', t: 'B', borj: '—',     hlif: '18:10', ezzahra: '18:14', rades: '18:25', tunis: '18:36' },
    { n: '174', t: 'A', borj: '18:30', hlif: '18:41', ezzahra: '18:51', rades: '19:03', tunis: '19:13' },
    { n: '176', t: 'B', borj: '—',     hlif: '19:10', ezzahra: '19:14', rades: '19:25', tunis: '19:36' },
    { n: '178', t: 'A', borj: '19:30', hlif: '19:41', ezzahra: '19:51', rades: '20:03', tunis: '20:13' },
    { n: '180', t: 'B', borj: '—',     hlif: '20:10', ezzahra: '20:14', rades: '20:25', tunis: '20:36' },
    { n: '182', t: 'A', borj: '20:30', hlif: '20:41', ezzahra: '20:51', rades: '21:03', tunis: '21:13' },
    { n: '186', t: 'A', borj: '21:30', hlif: '21:41', ezzahra: '21:51', rades: '22:03', tunis: '22:13' },
    { n: '190', t: 'A', borj: '22:30', hlif: '22:41', ezzahra: '22:51', rades: '23:03', tunis: '23:13' },
    { n: '194', t: 'A', borj: '23:30', hlif: '23:41', ezzahra: '23:51', rades: '0:03',  tunis: '0:13'  },
];

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
    const [dir, setDir] = useState('south'); // 'south' = Tunis→Borj, 'north' = Borj→Tunis

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
                <Text style={s.headerTitle}>🚆 Horaires Banlieue Sud</Text>
                <Text style={s.headerSub}>SNCFT · Ramadan 2026</Text>
            </View>

            {/* Toggle */}
            <View style={s.toggle}>
                <TouchableOpacity
                    style={[s.btn, dir === 'south' && s.btnActive]}
                    onPress={() => setDir('south')}
                >
                    <Text style={[s.btnTxt, dir === 'south' && s.btnTxtActive]}>
                        Tunis → Borj Cédria
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.btn, dir === 'north' && s.btnActive]}
                    onPress={() => setDir('north')}
                >
                    <Text style={[s.btnTxt, dir === 'north' && s.btnTxtActive]}>
                        Borj Cédria → Tunis
                    </Text>
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

            {/* Back */}
            <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
                <Text style={s.backTxt}>← Retour</Text>
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