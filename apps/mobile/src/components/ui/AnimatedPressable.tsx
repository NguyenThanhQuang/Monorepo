import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MOTION } from "../../theme";

const APressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedPressable({
  children,
  scaleTo = 0.98,
  style,
  ...props
}: PressableProps & { scaleTo?: number; style?: any }) {
  const s = useSharedValue(1);
  const o = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
    opacity: o.value,
  }));

  return (
    <APressable
      {...props}
      onPressIn={(e) => {
        s.value = withTiming(scaleTo, { duration: MOTION.duration.fast, easing: MOTION.easing.emphasized });
        o.value = withTiming(0.92, { duration: MOTION.duration.fast, easing: MOTION.easing.emphasized });
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: MOTION.duration.normal, easing: MOTION.easing.standard });
        o.value = withTiming(1, { duration: MOTION.duration.normal, easing: MOTION.easing.standard });
        props.onPressOut?.(e);
      }}
      style={[style, aStyle]}
    >
      {children}
    </APressable>
  );
}
