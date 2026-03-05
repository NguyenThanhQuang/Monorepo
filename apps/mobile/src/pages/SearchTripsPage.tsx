import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SearchFormData, Trip, Location } from "../types/index-types";
import { useSearchTrips } from "../hooks/useSearchTrips";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import Header from "../components/common/Header";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import SearchForm from "../components/search/SearchForm";
import TripCard from "../components/search/TripCard";
import RecentSearches from "../components/search/RecentSearches";

const SearchTripsPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState<SearchFormData>({
    from: "",
    to: "",
    departureDate: "",
    passengers: "1",
  });

  // Custom hooks
  const {
    trips,
    loading: searchLoading,
    error,
    searchTrips,
    clearResults,
  } = useSearchTrips();
  const {
    locations,
    suggestions,
    loading: locationLoading,
    searchLocations,
    clearSuggestions,
  } = useLocationSearch();
  const { recentSearches, saveRecentSearch, clearRecentSearches } =
    useRecentSearches();

  // Initialize default date
  useEffect(() => {
    // ✅ Dev (Expo Go): seed data thường nằm ở hôm qua/hôm kia → set mặc định = hôm qua để dễ test
    // ✅ Prod: dùng ngày hiện tại
    const today = new Date();
    const base = __DEV__ ? new Date(today.getTime() - 24 * 60 * 60 * 1000) : today;
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    setFormData((prev) => ({ ...prev, departureDate: `${yyyy}-${mm}-${dd}` }));
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = async () => {
    if (!formData.from || !formData.to || !formData.departureDate) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin tìm kiếm");
      return;
    }

    try {
      console.log("🔍 Starting search with form data:", formData);
      await searchTrips(formData);
      await saveRecentSearch(formData.from, formData.to);
    } catch (err) {
      console.error("Search error:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm kiếm chuyến đi");
    }
  };

  const handleTripPress = (trip: Trip) => {
    console.log("🎯 Trip selected:", trip);
    navigation.navigate("TripDetails", { trip });
  };

  const handleBookNow = (trip: Trip) => {
    console.log("🎫 Booking trip:", trip);
    navigation.navigate("BookingCheckout", {
      trip,
      selectedSeats: [],
      totalAmount: trip.price,
    });
  };

  const handleRecentSearchSelect = (from: string, to: string) => {
    console.log("🔄 Recent search selected:", { from, to });
    setFormData((prev) => ({ ...prev, from, to }));
  };

  const handleClearResults = () => {
    console.log("🗑️ Clearing search results");
    clearResults();
    clearSuggestions();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Tìm chuyến đi" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Form */}
        <SearchForm
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleSearchSubmit}
          loading={searchLoading}
        />

        {/* Recent Searches */}
        <RecentSearches
          searches={recentSearches}
          onSearchSelect={handleRecentSearchSelect}
          onClearAll={clearRecentSearches}
        />

        {/* Search Results */}
        {trips.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Kết quả tìm kiếm ({trips.length})
              </Text>
              <TouchableOpacity onPress={handleClearResults}>
                <Text style={styles.clearResultsText}>Xóa kết quả</Text>
              </TouchableOpacity>
            </View>

            {trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onPress={handleTripPress}
                onBookNow={handleBookNow}
              />
            ))}
          </View>
        )}

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={handleSearchSubmit} />}

        {/* Loading Indicator */}
        {searchLoading && (
          <LoadingSpinner text="Đang tìm kiếm chuyến đi..." size="large" />
        )}

        {/* Empty State */}
        {!searchLoading && trips.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Chưa có kết quả tìm kiếm</Text>
            <Text style={styles.emptySubtitle}>
              Hãy nhập thông tin và nhấn "Tìm chuyến đi" để bắt đầu
            </Text>
          </View>
        )}

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              Form Data: {JSON.stringify(formData)}
            </Text>
            <Text style={styles.debugText}>Trips Found: {trips.length}</Text>
            <Text style={styles.debugText}>
              Loading: {searchLoading ? "Yes" : "No"}
            </Text>
            <Text style={styles.debugText}>Error: {error || "None"}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  clearResultsText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
});

export default SearchTripsPage;
