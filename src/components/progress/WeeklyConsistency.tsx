import React from "react";
import { Text, View } from "react-native";
import ProgressBar from "./ProgressBar";

const WeeklyConsistency = () => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-2">Weekly Consistency</Text>

      <View className="flex-row justify-between mb-2">
        <Text className="text-xs text-gray-400">Meals logged this week</Text>
        <Text className="text-xs font-medium">19/21</Text>
      </View>

      <ProgressBar progress={0.9} />
    </View>
  );
};

export default WeeklyConsistency;
