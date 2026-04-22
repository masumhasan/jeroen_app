import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function FeedTabs() {
  return (
    <View className="flex-row px-5 mb-4">
      <TouchableOpacity className="bg-[#89957F] px-6 py-2 rounded-xl mr-3">
        <Text className="text-white font-medium">Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-gray-200 px-6 py-2 rounded-xl">
        <Text className="text-gray-600 font-medium">Topics</Text>
      </TouchableOpacity>
    </View>
  );
}
