// mobile-app/src/navigation/BottomTabNavigator.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Pressable,
  Vibration,
  LayoutChangeEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { RootState } from "../store/index-store";
import { COLORS, SPACING, withOpacity } from "../theme";

import {
  HomeScreen,
  SearchTripsScreen,
  BusTrackingScreen,
  ProfileScreen,
  DriverHomeScreen,
} from "../screens/index-screen";

import MyBookingsScreen from "../screens/booking/MyBookingsScreen";

const Tab = createBottomTabNavigator();

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();

  const activeColor = COLORS.primary.main;
  const inactiveColor = withOpacity(COLORS.text.secondary, 0.65);

  const [barW, setBarW] = useState(0);
  const indexSV = useSharedValue(state.index);

  // ✅ animate pill when index changes
  useEffect(() => {
    indexSV.value = withTiming(state.index, { duration: 220 });
  }, [state.index]);

  const tabsCount = state.routes.length;

  // widths: tabBar has paddingHorizontal = SPACING.sm (left & right)
  const usableW = useMemo(() => {
    return Math.max(0, barW - SPACING.sm * 2);
  }, [barW]);

  const pillStyle = useAnimatedStyle(() => {
    if (!usableW || !tabsCount) return { opacity: 0 };

    const itemW = usableW / tabsCount;
    return {
      opacity: 1,
      width: itemW,
      transform: [{ translateX: indexSV.value * itemW }],
    };
  });

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarW(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onBarLayout}
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, SPACING.sm),
        },
      ]}
    >
      {/* ✅ moving pill background (one only) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.movingPill,
          { backgroundColor: withOpacity(activeColor, 0.12) },
          pillStyle,
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }

          // Haptic
          try {
            if (Platform.OS !== "web" && Haptics?.impactAsync) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
            } else {
              Vibration.vibrate(10);
            }
          } catch {}
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // icon map
        let iconName: keyof typeof Ionicons.glyphMap = "help-outline";
        if (route.name === "Home") iconName = isFocused ? "home" : "home-outline";
        else if (route.name === "SearchTrips") iconName = isFocused ? "search" : "search-outline";
        else if (route.name === "MyBookings") iconName = isFocused ? "bookmark" : "bookmark-outline";
        else if (route.name === "BusTracking") iconName = isFocused ? "location" : "location-outline";
        else if (route.name === "Profile") iconName = isFocused ? "person" : "person-outline";
        else if (route.name === "Driver") iconName = isFocused ? "car" : "car-outline";

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={typeof label === "string" ? label : route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            android_ripple={{
              color: withOpacity(activeColor, 0.12),
              borderless: false,
            }}
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={23}
              color={isFocused ? activeColor : inactiveColor}
            />

            {/* ✅ reserve height; avoid jump; opacity keeps it clean */}
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  opacity: isFocused ? 1 : 0,
                },
              ]}
            >
              {typeof label === "string" ? label : route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const BottomTabNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isDriver = !!user?.roles?.includes("driver") || !!user?.roles?.includes("company_admin") || !!user?.roles?.includes("COMPANY_ADMIN");

  useEffect(() => {}, [isDriver]);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen
        name="SearchTrips"
        component={SearchTripsScreen}
        options={{ tabBarLabel: "Tìm kiếm" }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ tabBarLabel: "Vé" }}
      />
      <Tab.Screen
        name="BusTracking"
        component={BusTrackingScreen}
        options={{ tabBarLabel: "Theo dõi" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Hồ sơ" }}
      />
      {isDriver && (
        <Tab.Screen
          name="Driver"
          component={DriverHomeScreen}
          options={{ tabBarLabel: "Tài xế" }}
        />
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingTop: 4,

    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // ✅ one moving background
  movingPill: {
    position: "absolute",
    left: SPACING.sm, // match paddingHorizontal
    top: 8,
    bottom: 10,
    borderRadius: 14,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 16,
    overflow: "hidden",
  },

  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    minHeight: 14,
    textAlign: "center",
  },
});

export default BottomTabNavigator;
