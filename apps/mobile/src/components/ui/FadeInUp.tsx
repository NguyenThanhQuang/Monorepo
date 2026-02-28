import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { MOTION } from "../../theme";

export default function FadeInUp({
  children,
  delay = 0,
  distance = 14,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}) {
  const o = useSharedValue(0);
  const y = useSharedValue(distance);

  useEffect(() => {
    o.value = withDelay(
      delay,
      withTiming(1, { duration: MOTION.duration.slow, easing: MOTION.easing.standard })
    );
    y.value = withDelay(
      delay,
      withTiming(0, { duration: MOTION.duration.slow, easing: MOTION.easing.standard })
    );
  }, [delay, distance]);

  const s = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={s}>{children}</Animated.View>;
}
