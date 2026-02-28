import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function TicketScreen({ navigation, route }: any) {
  const { bookingInfo } = route.params;
  const { language, t } = useLanguage();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 60 }}>✅</Text>
        </View>
        <Text style={styles.successText}>
          {language === 'vi' ? 'Đặt vé thành công!' : 'Booking Successful!'}
        </Text>

        {/* Ticket View */}
        <View style={[styles.ticket, { backgroundColor: colors.background }]}>
          {/* Top part */}
          <View style={styles.ticketHeader}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>VeXe.com</Text>
            <Text style={{ color: colors.textSecondary }}>#VX{Math.floor(Math.random() * 100000)}</Text>
          </View>

          <View style={[styles.divider, { borderStyle: 'dashed', borderColor: colors.border }]} />

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'vi' ? 'Hành khách' : 'Passenger'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{bookingInfo.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'vi' ? 'Số điện thoại' : 'Phone'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{bookingInfo.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'vi' ? 'Chuyến' : 'Route'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>TP.HCM → Đà Lạt</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'vi' ? 'Ngày giờ' : 'Time'}</Text>
              <Text style={[styles.value, { color: colors.text }]}>20/12/2024 • 06:00</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'vi' ? 'Ghế' : 'Seats'}</Text>
              <Text style={[styles.value, { color: colors.primary }]}>{bookingInfo.selectedSeats.join(', ')}</Text>
            </View>
          </View>

          <View style={[styles.divider, { borderStyle: 'dashed', borderColor: colors.border }]} />

          {/* QR Code Placeholder */}
          <View style={styles.qrContainer}>
            <View style={[styles.qrPlaceholder, { borderColor: colors.text }]}>
              <Text style={{ fontSize: 100 }}>🔳</Text>
            </View>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
              {language === 'vi' ? 'Đưa mã này cho nhân viên' : 'Show this code to staff'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>
            {language === 'vi' ? 'Về trang chủ' : 'Back to Home'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  successIcon: {
    marginBottom: 16,
    marginTop: 20,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
  },
  ticket: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    borderWidth: 1,
    height: 1,
    marginVertical: 16,
  },
  details: { gap: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  qrContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  qrPlaceholder: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});