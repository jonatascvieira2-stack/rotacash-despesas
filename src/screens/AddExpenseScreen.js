import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { addExpense } from '../database/database';

export function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('combustivel');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'combustivel', label: '⛽ Combustível' },
    { id: 'alimentacao', label: '🍽️ Alimentação' },
    { id: 'pedagio', label: '🛣️ Pedágio' },
    { id: 'hospedagem', label: '🏨 Hospedagem' },
    { id: 'manutencao', label: '🔧 Manutenção' },
    { id: 'outros', label: '📦 Outros' },
  ];

  const handleSave = async () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Atenção', 'Informe um valor numérico válido.');
      return;
    }

    setSaving(true);
    try {
      await addExpense({
        amount: numAmount,
        category,
        paymentMethod,
        description,
        date: new Date().toISOString().split('T')[0]
      });
      Alert.alert('Sucesso', 'Despesa salva no SQLite!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar no banco local.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.amountInput}
        placeholder="0,00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        autoFocus
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryBtn, category === cat.id && styles.categoryBtnActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Text style={[styles.categoryBtnText, category === cat.id && styles.categoryBtnTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Descrição / Estabelecimento</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Posto Petrobras KM 120"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity 
        style={[styles.saveButton, saving && { opacity: 0.6 }]} 
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Gravando...' : 'Salvar Despesa'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 14 },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    padding: 14,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    fontSize: 15,
    padding: 12,
    color: '#1E293B'
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8
  },
  categoryBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  categoryBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  categoryBtnTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
