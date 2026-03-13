import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import HiScreen from './src/screens/Lost and found';
import ReclamationsScreen from './src/screens/Reclamations';
import ScheduleScreen from './src/screens/Schedule';
import LearnMoreScreen from './src/screens/learn more about us';

// Auth Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import VerifyCodeScreen from './src/screens/Auth/VerifyCodeScreen';
import AdminScreen from './src/screens/AdminScreen';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: { backgroundColor: '#1E3A8A' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Trains en Temps Réel' }} />
                <Stack.Screen name="Reclamations" component={ReclamationsScreen} options={{ title: 'Réclamations' }} />
                <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Horaires' }} />
                <Stack.Screen name="learn more about us" component={LearnMoreScreen} options={{ title: 'À propos' }} />

                {/* Auth Flow */}
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Se Connecter' }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "S'inscrire" }} />
                <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ title: 'Vérification' }} />

                {/* Protected Routes */}
                <Stack.Screen
                    name="Lost and found"
                    component={user ? HiScreen : LoginScreen}
                    options={{ title: 'Objets Perdus/Trouvés' }}
                />

                {/* Admin Route */}
                {user && user.role === 'admin' && (
                    <Stack.Screen name="AdminDashboard" component={AdminScreen} options={{ title: 'Administration' }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Navigation />
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;
