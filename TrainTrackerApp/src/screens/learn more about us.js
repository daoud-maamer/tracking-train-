import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LearnMoreScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.emoji}>ℹ️</Text>
                <Text style={styles.title}>About Us</Text>
                <Text style={styles.message}>Welcome to the Learn More About Us Page</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F9FF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 24,
        color: '#374151',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LearnMoreScreen;
