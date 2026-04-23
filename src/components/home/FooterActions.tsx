import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onRegenerate: () => void;
  regenerating: boolean;
}

export default function FooterActions({ onRegenerate, regenerating }: Props) {
  return (
    <View className="flex-row justify-between px-5 py-4 border-t border-gray-100 bg-white">
      <TouchableOpacity 
        onPress={() => router.push("/shopping_list")}
        className="flex-1 border border-gray-300 rounded-xl py-4 items-center mr-3"
      >
        <Text className="text-gray-700">Shopping List</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRegenerate}
        disabled={regenerating}
        className={`flex-1 bg-[#7A8B6F] rounded-xl py-4 items-center ${regenerating ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-medium">
          {regenerating ? "Generating..." : "Regenerate"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
