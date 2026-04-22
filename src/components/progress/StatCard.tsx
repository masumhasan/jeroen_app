import { LinearGradient } from "expo-linear-gradient";
import { CalendarRange, Medal, TrendingDown } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type StatCardProps = {
  title: string;
  subtitle: string;
  index: number;
  trend?: "up" | "down" | "neutral";
  value: string;
};

const StatCard = ({ title, subtitle, index, trend, value }: StatCardProps) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const getTrendColorWorklet = (trendValue?: "up" | "down" | "neutral") => {
    "worklet";
    switch (trendValue) {
      case "up":
        return "#8A957F";
      case "down":
        return "#8A957F";
      default:
        return "#9F8B7A";
    }
  };
  const getTrendIconWorklet = (subtitleValue: string) => {
    switch (subtitleValue) {
      case "kg Lost":
        return <TrendingDown size={20} color={"#8A957F"} />;
      case "Weeks":
        return <CalendarRange size={20} color={"#9F8B7A"} />;
      default:
        return <Medal size={20} color={"#8A957F"} />;
    }
  };
  // #F9D8C120

  const getTrendBgColorWorklet = (subtitleValue: string) => {
    switch (subtitleValue) {
      case "kg Lost":
        return "#F9D8C120";
      case "Weeks":
        return "#E2DC9E20";
      default:
        return "#8A957F20";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "•";
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.95 : scale.value) }],
  }));

  const valueAnimatedStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(getTrendColorWorklet(trend), { duration: 300 }),
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => {
        pressed.value = true;
      }}
      onPressOut={() => {
        pressed.value = false;
      }}
      style={{
        width: "31%",
      }}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={[
            getTrendBgColorWorklet(subtitle),
            getTrendBgColorWorklet(subtitle),
          ]}
          className="rounded-2xl p-4 items-center  border border-gray-100"
        >
          <View>{getTrendIconWorklet(subtitle)}</View>
          <Animated.Text
            style={valueAnimatedStyle}
            className="text-2xl font-bold"
          >
            {title}
          </Animated.Text>

          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-400 mr-1">{getTrendIcon()}</Text>
            <Text className="text-xs text-gray-600 font-medium">
              {subtitle}
            </Text>
          </View>

          {/* Mini Progress Indicator */}
          <View className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <View
              style={[
                {
                  width: `${Math.min(100, parseInt(value))}%`,
                  backgroundColor: getTrendColorWorklet(trend),
                },
              ]}
              className="h-full rounded-full"
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default StatCard;
