import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <View style={styles.container}>
            {/* Hamburger Menu Button */}
            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
            >
                <View style={styles.menuIconContainer}>
                    <View style={styles.menuBar} />
                    <View style={styles.menuBar} />
                    <View style={styles.menuBar} />
                </View>
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.menuContainer}>
                        <View style={styles.menuHeader}>
                            <TouchableOpacity
                                onPress={() => setMenuVisible(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuItems}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    navigation.navigate('Lost and found');
                                }}
                            >
                                <Text style={styles.menuItemText}>Lost and found</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    navigation.navigate('Reclamations');
                                }}
                            >
                                <Text style={styles.menuItemText}>Reclamations</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    navigation.navigate('Schedule');
                                }}
                            >
                                <Text style={styles.menuItemText}>Schedule</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    navigation.navigate('learn more about us');
                                }}
                            >
                                <Text style={styles.menuItemText}>learn more about us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <Text style={styles.title}>Banlieue Sud Tracker</Text>
                <Text style={styles.subtitle}>SNCFT Réseau Express</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Suivez la position des trains de la Banlieue Sud de Tunis en temps réel.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Map')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Voir les trains</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Développé par</Text>
                <Text style={styles.authorNames}>Ahmed Idoudi & Daoud Ben Mamer</Text>
                <Text style={styles.supervisorTextHighlight}>Encadreur : Hassen Soyed (Directeur de mouvement)</Text>
                <Text style={styles.pfeText}>Projet PFE - 2026</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        height: '45%',
        backgroundColor: '#1E3A8A', // SNCFT Navy Blue
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logo: {
        fontSize: 60,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#E0E7FF',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        color: '#4B5563',
        marginBottom: 40,
        lineHeight: 26,
    },
    button: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
        width: '100%',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    authorNames: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginTop: 2,
    },
    pfeText: {
        fontSize: 11,
        color: '#D1D5DB',
        marginTop: 4,
    },
    supervisorTextHighlight: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E3A8A',
        marginTop: 4,
    },
    // New styles for hamburger menu
    menuButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuIconContainer: {
        width: 24,
        height: 18,
        justifyContent: 'space-between',
    },
    menuBar: {
        height: 2,
        width: '100%',
        backgroundColor: '#1E3A8A',
        borderRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '70%',
        height: '100%',
        backgroundColor: '#ffffffff',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuHeader: {
        padding: 20,
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#1E3A8A',
        fontWeight: 'bold',
    },
    menuItems: {
        padding: 20,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemText: {
        fontSize: 16,
        color: '#3e3751ff',
        fontWeight: '500',
    },
});

export default HomeScreen;