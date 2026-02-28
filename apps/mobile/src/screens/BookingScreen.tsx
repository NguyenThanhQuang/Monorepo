import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function BookingScreen({ navigation, route }: any) {
  const { selectedSeats, totalPrice } = route.params;
  const { language, t } = useLanguage();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!name || !phone) {
      Alert.alert(
        language === 'vi' ? 'Thông báo' : 'Notice',
        language === 'vi' ? 'Vui lòng điền tên và số điện thoại' : 'Please enter name and phone number'
      );
      return;
    }
    
    // Chuyển sang màn hình thanh toán
    navigation.navigate('Payment', {
      bookingInfo: {
        name,
        phone,
        email,
        selectedSeats,
        totalPrice,
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'vi' ? 'Thông tin đặt vé' : 'Booking Info'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Ticket Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'vi' ? 'Thông tin vé' : 'Ticket Summary'}
          </Text>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>{t('from')} - {t('to')}</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>TP.HCM → Đà Lạt</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>{language === 'vi' ? 'Ghế' : 'Seats'}</Text>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{selectedSeats.join(', ')}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('totalPrice')}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Passenger Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'vi' ? 'Thông tin liên hệ' : 'Contact Info'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Họ và tên' : 'Full Name'} <Text style={{color: colors.error}}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Nguyen Van A"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Số điện thoại' : 'Phone Number'} <Text style={{color: colors.error}}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="0912345678"
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="example@email.com"
              keyboardType="email-address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={handleContinue} style={{ flex: 1 }}>
          <LinearGradient
            colors={['#3B82F6', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{t('continue')}</Text>
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
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