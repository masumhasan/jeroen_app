import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function FooterActions() {
  return (
    <View className="flex-row justify-between px-5 py-4 border-t border-gray-100 bg-white">
      <TouchableOpacity className="flex-1 border border-gray-300 rounded-xl py-4 items-center mr-3">
        <Text className="text-gray-700">Shopping List</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/shopping_list")}
        className="flex-1 bg-[#7A8B6F] rounded-xl py-4 items-center"
      >
        <Text className="text-white font-medium">Regenerate</Text>
      </TouchableOpacity>
    </View>
  );
}
