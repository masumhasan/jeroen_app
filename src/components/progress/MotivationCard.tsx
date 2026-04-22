import React from "react";
import { Text, View } from "react-native";

const MotivationCard = () => {
  return (
    <View className="border-2 border-[#7b876d] rounded-2xl p-4 bg-[#f7f8f4] items-center">
      <Text className="font-semibold text-lg text-[#5f6b55]">
        Great Progress! 🎉
      </Text>

      <Text className="text-center text-gray-500 text-sm mt-1">
        You're 70% of the way to your goal.
      </Text>

      <Text className="text-center text-gray-500 text-sm">
        Keep up the amazing work and stay consistent!
      </Text>
    </View>
  );
};

export default MotivationCard;
