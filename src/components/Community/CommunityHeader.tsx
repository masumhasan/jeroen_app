import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function CommunityHeader() {
  return (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-xl font-semibold text-black">Community</Text>
      <TouchableOpacity
        onPress={() => router.push("/createpost")}
        className="bg-[#E7E7E7] p-2 rounded-full"
      >
        <Plus size={18} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
