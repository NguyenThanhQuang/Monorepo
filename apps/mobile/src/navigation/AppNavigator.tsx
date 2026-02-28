import React, { useEffect } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import * as Linking from "expo-linking";

import type { RootState } from "../store/store";

import AuthStack from "./AuthStack";
import MainTab from "./MainTab";
import { RootStackParamList, MainStackParamList } from "./types";

// Screens (MainStack)
import SearchTripsScreen from "../screens/search/SearchTripsScreen";
import TripDetailsScreen from "../screens/search/TripDetailsScreen";
import BookingScreen from "../screens/booking/BookingScreen";
import BookingCheckoutScreen from "../screens/booking/BookingCheckoutScreen";
import MyBookingsScreen from "../screens/booking/MyBookingsScreen";
import ChangePasswordScreen from "../screens/auth/ChangePasswordScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LoyaltyProgramScreen from "../screens/profile/LoyaltyProgramScreen";
import BusTrackingScreen from "../screens/common/BusTrackingScreen";
import DriveScreen from "../screens/profile/DriveScreen";
import DriverHomeScreen from "../screens/driver/DriverHomeScreen";
import DriverScannerScreen from "../screens/driver/DriverScannerScreen";
import DriverRegisterScreen from "../screens/driver/DriverRegisterScreen";
import DriverRatingsScreen from "../screens/driver/DriverRatingsScreen";
import ReviewDriverScreen from "../screens/reviews/ReviewDriverScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";
import PaymentCheckoutScreen from "../screens/booking/PaymentCheckoutScreen";
import TicketDetailScreen from "../screens/booking/TicketDetailScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "exp://", "obtp://"],
  config: {
    screens: {
      ResetPassword: "reset-password",
      VerifyEmail: "verify-email",
      PaymentStatus: "payment-status",
      Main: "main",
      Auth: "auth",
    },
  },
};

const MainStackNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTab} />
    <MainStack.Screen name="SearchTrips" component={SearchTripsScreen} />
    <MainStack.Screen name="TripDetails" component={TripDetailsScreen} />
    <MainStack.Screen name="Booking" component={BookingScreen} />
    <MainStack.Screen
      name="BookingCheckout"
      component={BookingCheckoutScreen}
    />
    <MainStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
    <MainStack.Screen name="TicketDetail" component={TicketDetailScreen} />
    <MainStack.Screen name="MyBookings" component={MyBookingsScreen} />
    <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <MainStack.Screen name="Profile" component={ProfileScreen} />
    <MainStack.Screen name="Drive" component={DriveScreen} />
    <MainStack.Screen name="LoyaltyProgram" component={LoyaltyProgramScreen} />
    <MainStack.Screen name="BusTracking" component={BusTrackingScreen} />
    <MainStack.Screen name="DriverHome" component={DriverHomeScreen} />
    <MainStack.Screen name="DriverScanner" component={DriverScannerScreen} />
    <MainStack.Screen name="DriverRegister" component={DriverRegisterScreen} />
    <MainStack.Screen name="DriverRatings" component={DriverRatingsScreen} />
    <MainStack.Screen name="ReviewDriver" component={ReviewDriverScreen} />
  </MainStack.Navigator>
);

export default function AppNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    console.log("AppNavigator auth:", {
      isAuthenticated,
      userRole: user?.roles,
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      console.log("Initial URL:", url);
    });
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "Main" : "Auth"}
      >
        {/* Flow bình thường */}
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}

        {/* Deep link screens: vẫn hoạt động bình thường */}
        <RootStack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
        />
        <RootStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />

      {/* Deep link PaymentStatus: chuyển vào PaymentCheckout (có polling) */}
      <RootStack.Screen
        name="PaymentStatus"
        component={PaymentCheckoutScreen}
      />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
