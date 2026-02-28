import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function PaymentScreen({ navigation, route }: any) {
  const { bookingInfo } = route.params;
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'momo', name: 'Momo', icon: '🟪' },
    { id: 'zalo', name: 'ZaloPay', icon: '🟦' },
    { id: 'card', name: 'Visa/Mastercard', icon: '💳' },
    { id: 'cash', name: language === 'vi' ? 'Tiền mặt' : 'Cash', icon: '💵' },
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    // Giả lập loading 2 giây
    setTimeout(() => {
      setIsProcessing(false);
      navigation.replace('Ticket', { bookingInfo });
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('payment')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {language === 'vi' ? 'Phương thức thanh toán' : 'Payment Method'}
        </Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { 
                backgroundColor: colors.surface, 
                borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                borderWidth: selectedMethod === method.id ? 2 : 1
              }
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{method.icon}</Text>
            <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
            <View style={[
              styles.radio, 
              { 
                borderColor: selectedMethod === method.id ? colors.primary : colors.textSecondary,
                backgroundColor: selectedMethod === method.id ? colors.primary : 'transparent'
              }
            ]} />
          </TouchableOpacity>
        ))}

        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
             <Text style={{ color: colors.textSecondary }}>{t('totalPrice')}</Text>
             <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}>
               {bookingInfo.totalPrice.toLocaleString('vi-VN')}đ
             </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={handlePayment} disabled={isProcessing}>
          <LinearGradient
            colors={['#3B82F6', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {language === 'vi' ? 'Thanh toán ngay' : 'Pay Now'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  summary: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});