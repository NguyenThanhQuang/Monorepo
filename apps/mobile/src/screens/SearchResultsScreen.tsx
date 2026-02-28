import React from 'react';
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

export default function SearchResultsScreen({ navigation, route }: any) {
  const { from, to, date } = route.params;
  const { language, t } = useLanguage();
  const { colors } = useTheme();

  const mockTrips = [
    {
      id: '1',
      company: 'Phương Trang',
      departureTime: '06:00',
      arrivalTime: '12:30',
      price: 220000,
      availableSeats: 15,
      busType: 'Giường nằm VIP',
      rating: 4.8,
    },
    {
      id: '2',
      company: 'Mai Linh',
      departureTime: '08:00',
      arrivalTime: '14:30',
      price: 200000,
      availableSeats: 8,
      busType: 'Ghế ngồi',
      rating: 4.5,
    },
    {
      id: '3',
      company: 'Kumho Samco',
      departureTime: '14:00',
      arrivalTime: '20:30',
      price: 250000,
      availableSeats: 20,
      busType: 'Limousine',
      rating: 4.9,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← {t('back')}</Text>
        </TouchableOpacity>
        <View style={styles.routeInfo}>
          <Text style={[styles.routeText, { color: colors.text }]}>
            {from} → {to}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{date}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {mockTrips.length} {language === 'vi' ? 'chuyến xe' : 'trips'}
        </Text>

        {mockTrips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={[styles.tripCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
          >
            <View style={styles.tripHeader}>
              <Text style={[styles.companyName, { color: colors.text }]}>{trip.company}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {trip.rating}</Text>
              </View>
            </View>

            <View style={styles.tripTime}>
              <View style={styles.timeBlock}>
                <Text style={[styles.time, { color: colors.text }]}>{trip.departureTime}</Text>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  {language === 'vi' ? 'Đi' : 'Depart'}
                </Text>
              </View>

              <View style={styles.duration}>
                <View style={[styles.durationLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.durationText, { color: colors.textSecondary }]}>6h 30m</Text>
              </View>

              <View style={styles.timeBlock}>
                <Text style={[styles.time, { color: colors.text }]}>{trip.arrivalTime}</Text>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  {language === 'vi' ? 'Đến' : 'Arrive'}
                </Text>
              </View>
            </View>

            <View style={styles.tripFooter}>
              <View>
                <Text style={[styles.busType, { color: colors.textSecondary }]}>{trip.busType}</Text>
                <Text style={[styles.seats, { color: colors.success }]}>
                  {trip.availableSeats} {language === 'vi' ? 'chỗ trống' : 'seats available'}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.primary }]}>
                  {trip.price.toLocaleString('vi-VN')}đ
                </Text>
                <LinearGradient
                  colors={['#3B82F6', '#14B8A6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.selectButton}
                >
                  <Text style={styles.selectButtonText}>
                    {language === 'vi' ? 'Chọn' : 'Select'}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#92400E',
  },
  tripTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: 'center',
  },
  time: {
    fontSize: 20,
    fontWeight: '700',
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  duration: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  durationLine: {
    height: 2,
    width: '100%',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  busType: {
    fontSize: 14,
    marginBottom: 4,
  },
  seats: {
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
