import React from "react";
import { Text, View } from "react-native";

type Props = {
  selectedCount: number;
  totalItems: number;
  progressPercentage: number;
};

const ProgressHeader = ({
  selectedCount,
  totalItems,
  progressPercentage,
}: Props) => {
  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600 text-[13px]">
          {selectedCount} of {totalItems} items
        </Text>
        <Text className="text-[#89957F] text-[13px]">
          {progressPercentage}%
        </Text>
      </View>

      <View className="w-full h-2 bg-gray-200 rounded-full">
        <View
          className="h-2 bg-[#89957F] rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressHeader;
