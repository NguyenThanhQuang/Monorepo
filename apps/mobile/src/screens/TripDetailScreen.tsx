import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function TripDetailScreen({ navigation }: any) {
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const seats = Array.from({ length: 40 }, (_, i) => ({
    number: `${i + 1}`,
    status: Math.random() > 0.7 ? 'booked' : 'available',
  }));

  const totalPrice = selectedSeats.length * 220000;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'vi' ? 'Chọn ghế' : 'Select Seats'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Trip Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.companyName, { color: colors.text }]}>Phương Trang</Text>
          <View style={styles.routeInfo}>
            <Text style={[styles.routeText, { color: colors.text }]}>TP.HCM → Đà Lạt</Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>20/12/2024 • 06:00</Text>
          </View>
        </View>

        {/* Seat Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, { backgroundColor: colors.border }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Trống' : 'Available'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Đã chọn' : 'Selected'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Đã đặt' : 'Booked'}
            </Text>
          </View>
        </View>

        {/* Seat Map */}
        <View style={[styles.seatMap, { backgroundColor: colors.surface }]}>
          <Text style={[styles.seatMapTitle, { color: colors.text }]}>
            {language === 'vi' ? 'Sơ đồ ghế' : 'Seat Map'}
          </Text>

          <View style={styles.seatsGrid}>
            {seats.map((seat) => (
              <TouchableOpacity
                key={seat.number}
                style={[
                  styles.seat,
                  {
                    backgroundColor:
                      seat.status === 'booked'
                        ? '#9CA3AF'
                        : selectedSeats.includes(seat.number)
                        ? '#3B82F6'
                        : colors.border,
                  },
                ]}
                disabled={seat.status === 'booked'}
                onPress={() => toggleSeat(seat.number)}
              >
                <Text
                  style={[
                    styles.seatNumber,
                    {
                      color:
                        seat.status === 'booked' || selectedSeats.includes(seat.number)
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {seat.number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.selectedSeats, { color: colors.textSecondary }]}>
              {language === 'vi' ? 'Đã chọn:' : 'Selected:'} {selectedSeats.join(', ')}
            </Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Booking', { selectedSeats, totalPrice })}>
            <LinearGradient
              colors={['#3B82F6', '#14B8A6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>{t('continue')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  seatMap: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 100,
  },
  seatMapTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seat: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  selectedSeats: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  continueButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
