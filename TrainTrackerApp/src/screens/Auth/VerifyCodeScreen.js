import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { verifyEmail } from '../../services/api';

const VerifyCodeScreen = ({ route, navigation }) => {
    const { email } = route.params || {};
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!code) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, code);
            Alert.alert('Success', 'Email verified successfully! You can now log in.');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Verification Failed', error.response?.data?.error || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

            <TextInput
                style={styles.input}
                placeholder="6-Digit Code"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        textAlign: 'center',
        fontSize: 20,
        letterSpacing: 5
    },
    button: {
        backgroundColor: '#1E3A8A',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default VerifyCodeScreen;
