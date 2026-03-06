import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index-store';
import { Ionicons } from '@expo/vector-icons';

export default function DriverHomeScreen({ navigation }: any) {
  const auth = useSelector((s: RootState) => s.auth);

  const driver = auth.user;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={72} color="#1976d2" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{driver?.name || 'Tài xế'}</Text>
          <Text style={styles.info}>{driver?.phone || '-'}</Text>
          <Text style={styles.info}>{driver?.email || '-'}</Text>
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DriverScanner')}>
          <Ionicons name="scan-outline" size={30} color="#1976d2" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Quét vé</Text>
            <Text style={styles.cardSubtitle}>Quét vé hành khách để xác thực</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DriverRatings')}>
          <Ionicons name="star-outline" size={30} color="#1976d2" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Đánh giá của tôi</Text>
            <Text style={styles.cardSubtitle}>Xem điểm trung bình & nhận xét</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DriverTracking')}>
          <Ionicons name="navigate-outline" size={30} color="#1976d2" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Chia sẻ vị trí</Text>
            <Text style={styles.cardSubtitle}>Bật GPS để hành khách theo dõi lộ trình</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafb' },
  header: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700' },
  info: { color: '#666' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { color: '#666', fontSize: 13 },
});
