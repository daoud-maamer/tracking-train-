import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform } from 'react-native';

const LearnMoreScreen = () => {

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>🚆 About TrainTracker</Text>
                    <Text style={styles.headerSubtitle}>
                        Your dedicated smart mobility companion for the Tunis southern suburban train line.
                    </Text>
                </View>

                {/* Intro Section */}
                <View style={styles.card}>
                    <Text style={styles.paragraph}>
                        Navigating daily commutes can be challenging, which is why we created an all-in-one application designed to make your journey smoother, safer, and entirely predictable. 
                        Whether you are a daily commuter or an occasional traveler, TrainTracker puts control of your journey right in your pocket.
                    </Text>
                </View>

                {/* Mission Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🌟 Our Mission</Text>
                    <Text style={styles.paragraph}>
                        Our mission is to modernize and elevate the public transportation experience in Tunis. By empowering commuters with real-time data, community-driven support systems, and instant digital assistance, we aim to reduce waiting times, minimize travel stress, and provide a reliable tool for every step of your ride.
                    </Text>
                </View>

                {/* Features Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>⚡ Key Features</Text>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📍</Text>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Live Train Tracking</Text>
                            <Text style={styles.featureDescription}>Monitor the exact location of your incoming train in real-time on an interactive map.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🕒</Text>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Accurate Schedules</Text>
                            <Text style={styles.featureDescription}>Instantly check up-to-date train arrival and departure times for any station.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🔍</Text>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Lost & Found</Text>
                            <Text style={styles.featureDescription}>Easily report lost items or help the community by quickly posting belongings you've found.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>💬</Text>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Smart Chatbot</Text>
                            <Text style={styles.featureDescription}>Get immediate, automated answers to your transit-related questions 24/7.</Text>
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🛠️</Text>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Reclamations & Support</Text>
                            <Text style={styles.featureDescription}>Directly report issues, submit feedback, and receive prompt support to help improve transport services.</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Made with ❤️ for Tunis commuters</Text>
                    <Text style={styles.footerVersion}>Version 1.0.0</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Soft modern background
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A', // Deep primary blue
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B', // Slate gray
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5, // For Android shadow
        borderWidth: Platform.OS === 'android' ? 1 : 0,
        borderColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E3A8A',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
        textAlign: 'justify'
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    featureIcon: {
        fontSize: 28,
        marginRight: 15,
        marginTop: -2, 
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    footerVersion: {
        fontSize: 12,
        color: '#CBD5E1',
        marginTop: 5,
    }
});

export default LearnMoreScreen;
