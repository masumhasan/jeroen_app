import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import ProgressBar from "./ProgressBar";

const WeightJourneyCard = () => {
  const progress = 0.7; // 70% to goal
  const startWeight = 75;
  const currentWeight = 71.5;
  const targetWeight = 70;
  const weightLost = (startWeight - currentWeight).toFixed(1);
  const remainingToLose = (currentWeight - targetWeight).toFixed(1);

  const cardScale = useSharedValue(1);
  const weightPulse = useSharedValue(1);

  React.useEffect(() => {
    weightPulse.value = withSequence(withSpring(1.1), withSpring(1));
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const currentWeightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: weightPulse.value }],
  }));

  return (
    <Animated.View style={cardAnimatedStyle} className="mx-4 mb-4">
      <LinearGradient
        colors={["#ffffff", "#f8faf8"]}
        className="rounded-2xl p-5 shadow-sm border border-gray-100"
        style={{ elevation: 3 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Weight Journey
          </Text>
        </View>

        <View className="flex-row justify-between mb-6">
          {[
            { label: "Start", value: startWeight, unit: "kg" },
            {
              label: "Current",
              value: currentWeight,
              unit: "kg",
              animated: true,
            },
            { label: "Target", value: targetWeight, unit: "kg" },
          ].map((item, index) => (
            <View key={index} className="items-center">
              <Text className="text-gray-400 text-xs mb-1">{item.label}</Text>
              {item.animated ? (
                <Animated.View style={currentWeightStyle}>
                  <Text className="font-bold text-2xl text-[#6d7a61]">
                    {item.value}
                  </Text>
                </Animated.View>
              ) : (
                <Text className="font-bold text-2xl text-gray-800">
                  {item.value}
                </Text>
              )}
              <Text className="text-xs text-gray-400">{item.unit}</Text>
            </View>
          ))}
        </View>

        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">Progress to Goal</Text>
            <Text className="text-sm font-semibold text-[#6d7a61]">
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={progress} height={8} animated />
        </View>

        <View className="flex-row justify-center items-center mt-2">
          <Text className="text-xs text-gray-400">
            {remainingToLose} kg to go
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default WeightJourneyCard;
