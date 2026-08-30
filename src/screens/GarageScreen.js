import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { GarageScreen } from './src/screens/GarageScreen';

export function GarageScreen() {
  const [name, setName] = useState('');
  const [mileage, setMileage] = useState('');
  const [vehicles, setVehicles] = useState([]);

  const handleSave = () => {
    if (!name.trim() || !mileage.trim()) return;
    
    const newVehicle = { 
      id: Date.now().toString(), 
      name: name.trim(), 
      mileage: mileage.trim() 
    };
    
    setVehicles([newVehicle, ...vehicles]);
    setName('');
    setMileage('');
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Minha Garagem</Text>

      <Stack.Screen name="Garage" component={GarageScreen} options={{ title: 'Minha Garagem' }} />

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Veículo (Ex: Suzuki GSR 125)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Km atual no painel (Ex: 45000)"
          keyboardType="numeric"
          value={mileage}
          onChangeText={setMileage}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Cadastrar Veículo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Veículos Cadastrados</Text>
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.vehicleItem}>
            <Text style={styles.vehicleName}>{item.name}</Text>
            <Text style={styles.vehicleKm}>Km cadastrado: {item.mileage}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1F2937' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#4B5563' },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  vehicleItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#2563EB', elevation: 1 },
  vehicleName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  vehicleKm: { fontSize: 14, color: '#6B7280', marginTop: 4 }
});