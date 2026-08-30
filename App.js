import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/database/database';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { ReceiptScannerScreen } from './src/screens/ReceiptScannerScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Erro ao inicializar SQLite:', err);
      }
    }
    prepare();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.title}>RotaCash</Text>
        <Text style={styles.subtitle}>Iniciando banco de dados local SQLite...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#2563EB' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'RotaCash: Despesas' }} 
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ title: 'Nova Despesa' }} 
          />
          <Stack.Screen 
            name="ReceiptScanner" 
            component={ReceiptScannerScreen} 
            options={{ title: 'Escanear Recibo (IA)' }} 
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ title: 'Relatórios Pro' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center'
  }
});
