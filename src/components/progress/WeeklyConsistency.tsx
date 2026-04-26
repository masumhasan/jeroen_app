import React from "react";
import { Text, View } from "react-native";
import ProgressBar from "./ProgressBar";

type WeeklyConsistencyProps = {
  completed: number;
  total: number;
  label?: string;
};

const WeeklyConsistency = ({ completed, total, label }: WeeklyConsistencyProps) => {
  const safeTotal = Math.max(total, 1);
  const progress = Math.min(completed / safeTotal, 1);

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-2">Weekly Consistency</Text>

      <View className="flex-row justify-between mb-2">
        <Text className="text-xs text-gray-400">{label || "Check-ins this week"}</Text>
        <Text className="text-xs font-medium">
          {completed}/{safeTotal}
        </Text>
      </View>

      <ProgressBar progress={progress} />
    </View>
  );
};

export default WeeklyConsistency;
