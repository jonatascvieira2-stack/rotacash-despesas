import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getExpensesByTrip } from '../database/database';

export function ReportsScreen() {
  const [generating, setGenerating] = useState(false);

  const exportPdf = async () => {
    setGenerating(true);
    try {
      const expenses = await getExpensesByTrip('trip_default_1');
      const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

      const rows = expenses.map(e => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${e.date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${e.category.toUpperCase()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${e.description || '-'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: bold; text-align: right;">
            R$ ${e.amount.toFixed(2)}
          </td>
        </tr>
      `).join('');

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 24px; color: #1E293B;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #2563EB; padding-bottom: 12px;">
              <div>
                <h1 style="color: #2563EB; margin: 0;">RotaCash Pro</h1>
                <p style="margin: 4px 0 0 0; color: #64748B;">Relatório Consolidado de Despesas</p>
              </div>
              <div style="text-align: right;">
                <h3 style="margin: 0; color: #0F172A;">Total: R$ ${total.toFixed(2)}</h3>
                <small style="color: #94A3B8;">${expenses.length} lançamentos</small>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #F8FAFC; text-align: left;">
                  <th style="padding: 8px;">Data</th>
                  <th style="padding: 8px;">Categoria</th>
                  <th style="padding: 8px;">Descrição</th>
                  <th style="padding: 8px; text-align: right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <footer style="margin-top: 30px; font-size: 11px; color: #94A3B8; text-align: center;">
              Gerado via RotaCash Pro • SQLite Offline-First
            </footer>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.proCard}>
        <Text style={styles.proBadge}>👑 RECURSO PRO</Text>
        <Text style={styles.proTitle}>Exportação de Prestação de Contas</Text>
        <Text style={styles.proDesc}>
          Gere um relatório PDF com todos os lançamentos do banco local SQLite formatados para reembolso.
        </Text>

        <TouchableOpacity 
          style={[styles.pdfButton, generating && { opacity: 0.6 }]} 
          onPress={exportPdf}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.pdfButtonText}>📄 Gerar e Compartilhar PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  proCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  proBadge: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12
  },
  proTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  proDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  pdfButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
    alignItems: 'center'
  },
  pdfButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});
