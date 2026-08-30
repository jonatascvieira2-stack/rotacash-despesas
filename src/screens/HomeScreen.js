import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { getExpensesByTrip, deleteExpense } from '../database/database';

export function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    try {
      const data = await getExpensesByTrip('trip_default_1');
      setExpenses(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadExpenses();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleDelete = (id) => {
    Alert.alert('Excluir Despesa', 'Deseja apagar este registro do SQLite?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteExpense(id);
        loadExpenses();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total de Despesas (SQLite Local)</Text>
        <Text style={styles.summaryValue}>
          R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.summaryCount}>{expenses.length} lançamentos gravados</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.btnText}>+ Manual</Text>
        </TouchableOpacity>

        <TouchableOpacity 
         style={styles.button} 
           onPress={() => navigation.navigate('Garage')}>
            <Text style={styles.btnText}>🏍️ Minha Garagem</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnOcr]}
          onPress={() => navigation.navigate('ReceiptScanner')}
        >
          <Text style={styles.btnText}>📸 Ler Recibo (IA)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnPro]}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.btnText}>👑 Relatórios</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhuma despesa registrada ainda.</Text>
            <Text style={styles.emptySubtext}>Use os botões acima para lançar no SQLite.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.expenseCat}>{item.category.toUpperCase()}</Text>
              <Text style={styles.expenseDesc}>{item.description || 'Sem descrição'}</Text>
              <Text style={styles.expenseDate}>{item.date} • {item.payment_method.toUpperCase()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.expenseAmount}>
                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  summaryCard: { backgroundColor: '#2563EB', padding: 20, margin: 16, borderRadius: 16 },
  summaryLabel: { color: '#BFDBFE', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginVertical: 4 },
  summaryCount: { color: '#DBEAFE', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#0F172A' },
  btnOcr: { backgroundColor: '#10B981' },
  btnPro: { backgroundColor: '#F59E0B' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  expenseCat: { fontSize: 10, fontWeight: '800', color: '#2563EB' },
  expenseDesc: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  expenseDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  deleteBtn: { color: '#EF4444', fontSize: 11, fontWeight: '700', marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#475569' },
  emptySubtext: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 4 }
});
