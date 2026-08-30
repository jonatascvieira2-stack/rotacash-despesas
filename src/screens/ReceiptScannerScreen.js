import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analisarReciboComGemini } from '../services/gemini';
import { addExpense } from '../database/database';

export function ReceiptScannerScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão Negada', 'Autorize o acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64);
    }
  };

  const processWithGemini = async () => {
    if (!base64Image) {
      Alert.alert('Atenção', 'Capture uma foto primeiro.');
      return;
    }

    setLoading(true);
    try {
      const data = await analisarReciboComGemini(base64Image);
      
      await addExpense({
        amount: data.amount,
        category: data.category || 'outros',
        description: `${data.establishment || ''} - ${data.description || 'Cupom Fiscal'}`.trim(),
        date: data.date || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'pix',
        receiptImageUri: imageUri,
        ocrExtracted: true
      });

      Alert.alert(
        'Sucesso!',
        `Valor R$ ${data.amount.toFixed(2)} identificado e salvo no SQLite.`,
        [{ text: 'Ver Feed', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Erro OCR', 'Falha ao ler cupom fiscal. Verifique a chave Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leitura Inteligente com IA</Text>
      <Text style={styles.subtitle}>Fotografe uma nota fiscal para extração automática.</Text>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.placeholderText}>Nenhuma imagem capturada</Text>
        )}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
          <Text style={styles.captureBtnText}>📷 Abrir Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.processBtn, (!imageUri || loading) && { opacity: 0.5 }]} 
          onPress={processWithGemini}
          disabled={!imageUri || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.processBtnText}>✨ Analisar Cupom (IA)</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  previewBox: {
    width: '100%',
    height: 320,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed'
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderText: { color: '#94A3B8', fontWeight: '600' },
  buttons: { width: '100%', gap: 12, marginTop: 24 },
  captureBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center' },
  captureBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  processBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center' },
  processBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});
