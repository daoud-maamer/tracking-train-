import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import HiScreen from './src/screens/Lost and found';
import ReclamationsScreen from './src/screens/Reclamations';
import ScheduleScreen from './src/screens/Schedule';
import LearnMoreScreen from './src/screens/learn more about us';

const Stack = createNativeStackNavigator();

const App = () => {
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
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'SNCFT Tracker - Banlieue Sud' }}
                />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ title: 'Trains en Temps Réel' }}
                />
                <Stack.Screen
                    name="Lost and found"
                    component={HiScreen}
                    options={{ title: 'Lost and Found' }}
                />
                <Stack.Screen
                    name="Reclamations"
                    component={ReclamationsScreen}
                    options={{ title: 'Reclamations' }}
                />
                <Stack.Screen
                    name="Schedule"
                    component={ScheduleScreen}
                    options={{ title: 'Schedule' }}
                />
                <Stack.Screen
                    name="learn more about us"
                    component={LearnMoreScreen}
                    options={{ title: 'About Us' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
