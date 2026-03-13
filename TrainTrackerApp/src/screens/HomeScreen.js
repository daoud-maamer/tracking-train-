import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const HomeScreen = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [langPickerVisible, setLangPickerVisible] = useState(false);
    const { user, logoutUser } = useContext(AuthContext);
    const { lang, setLang, t } = useLanguage();

    return (
        <View style={styles.container}>

            {/* ── Hamburger Menu (top-left) ── */}
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
                <View style={styles.menuIconContainer}>
                    <View style={styles.menuBar} />
                    <View style={styles.menuBar} />
                    <View style={styles.menuBar} />
                </View>
            </TouchableOpacity>

            {/* ── Language Switcher (top-right) ── */}
            <TouchableOpacity style={styles.langButton} onPress={() => setLangPickerVisible(true)}>
                <Text style={styles.langFlag}>{LANGUAGES[lang].flag}</Text>
                <Text style={styles.langLabel}>{LANGUAGES[lang].label}</Text>
            </TouchableOpacity>

            {/* ── Language Picker Modal ── */}
            <Modal transparent animationType="fade" visible={langPickerVisible}
                onRequestClose={() => setLangPickerVisible(false)}>
                <TouchableOpacity style={styles.langOverlay} activeOpacity={1}
                    onPress={() => setLangPickerVisible(false)}>
                    <View style={styles.langPicker}>
                        {Object.entries(LANGUAGES).map(([code, info]) => (
                            <TouchableOpacity key={code} style={[
                                styles.langOption, lang === code && styles.langOptionActive
                            ]} onPress={() => { setLang(code); setLangPickerVisible(false); }}>
                                <Text style={styles.langOptionFlag}>{info.flag}</Text>
                                <Text style={[styles.langOptionText, lang === code && styles.langOptionTextActive]}>
                                    {info.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Side Menu Modal ── */}
            <Modal animationType="slide" transparent visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.menuContainer}>
                        <View style={styles.menuHeader}>
                            <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.menuItems}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Lost and found'); }}>
                                <Text style={styles.menuItemText}>🔍 {t('lostFound')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Reclamations'); }}>
                                <Text style={styles.menuItemText}>📋 {t('reclamations')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('Schedule'); }}>
                                <Text style={styles.menuItemText}>🕐 {t('schedule')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('learn more about us'); }}>
                                <Text style={styles.menuItemText}>ℹ️ {t('learnMore')}</Text>
                            </TouchableOpacity>
                            {user && user.role === 'admin' && (
                                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('AdminDashboard'); }}>
                                    <Text style={[styles.menuItemText, { color: '#16A34A', fontWeight: 'bold' }]}>⚙️ {t('adminDashboard')}</Text>
                                </TouchableOpacity>
                            )}
                            {user && (
                                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); logoutUser(); }}>
                                    <Text style={[styles.menuItemText, { color: '#DC2626' }]}>🚪 {t('logout')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.trainEmoji}>🚆</Text>
                <Text style={styles.title}>{t('appTitle')}</Text>
                <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
            </View>

            {/* ── Content ── */}
            <View style={styles.content}>
                <Text style={styles.description}>{t('homeDescription')}</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Map')} activeOpacity={0.8}>
                    <Text style={styles.buttonIcon}>🗺️</Text>
                    <Text style={styles.buttonText}>{t('seeTrains')}</Text>
                </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>{t('developedBy')}</Text>
                <Text style={styles.authorNames}>Ahmed Idoudi & Daoud Ben Mamer</Text>
                <Text style={styles.supervisorTextHighlight}>{t('supervisorLabel')}</Text>
                <Text style={styles.pfeText}>{t('pfeLabel')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    // Hamburger
    menuButton: {
        position: 'absolute', top: 50, left: 20, zIndex: 20,
        padding: 10, backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 10, elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    menuIconContainer: { width: 24, height: 18, justifyContent: 'space-between' },
    menuBar: { height: 2, width: '100%', backgroundColor: '#1E3A8A', borderRadius: 2 },

    // Language switcher
    langButton: {
        position: 'absolute', top: 50, right: 20, zIndex: 20,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 10, elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    langFlag: { fontSize: 18 },
    langLabel: { fontSize: 13, fontWeight: '700', color: '#1E3A8A' },
    langOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start', alignItems: 'flex-end' },
    langPicker: {
        marginTop: 105, marginRight: 16,
        backgroundColor: '#fff', borderRadius: 14,
        overflow: 'hidden', elevation: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8,
        minWidth: 110,
    },
    langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
    langOptionActive: { backgroundColor: '#EFF6FF' },
    langOptionFlag: { fontSize: 20 },
    langOptionText: { fontSize: 15, fontWeight: '600', color: '#374151' },
    langOptionTextActive: { color: '#1E3A8A', fontWeight: '700' },

    // Side menu
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    menuContainer: {
        position: 'absolute', top: 0, left: 0,
        width: '72%', height: '100%',
        backgroundColor: '#fff', elevation: 10,
        shadowColor: '#000', shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    menuHeader: { padding: 20, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    closeButton: { padding: 5 },
    closeButtonText: { fontSize: 24, color: '#1E3A8A', fontWeight: 'bold' },
    menuItems: { padding: 20 },
    menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    menuItemText: { fontSize: 16, color: '#3e3751', fontWeight: '500' },

    // Header
    header: {
        height: '45%', backgroundColor: '#1E3A8A',
        justifyContent: 'center', alignItems: 'center',
        borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    },
    trainEmoji: { fontSize: 64, marginBottom: 10 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#E0E7FF', textAlign: 'center', lineHeight: 24 },

    // Content
    content: { flex: 1, paddingHorizontal: 30, paddingTop: 40, alignItems: 'center' },
    description: { fontSize: 17, textAlign: 'center', color: '#4B5563', marginBottom: 38, lineHeight: 26 },
    button: {
        backgroundColor: '#1E3A8A', paddingVertical: 16, paddingHorizontal: 38,
        borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10,
        elevation: 5, shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
    },
    buttonIcon: { fontSize: 20 },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    // Footer
    footer: { position: 'absolute', bottom: 30, alignItems: 'center', width: '100%' },
    footerText: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
    authorNames: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 2 },
    supervisorTextHighlight: { fontSize: 12, fontWeight: '600', color: '#1E3A8A', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
    pfeText: { fontSize: 11, color: '#D1D5DB', marginTop: 4 },
});

export default HomeScreen;