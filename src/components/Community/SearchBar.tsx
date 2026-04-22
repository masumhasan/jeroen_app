import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

export default function SearchBar() {
  return (
    <View className="px-5 mb-3">
      <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
        <Search size={18} color="#999" />

        <TextInput
          placeholder="Search posts, topics, or users..."
          className="ml-2 flex-1 text-sm"
        />
      </View>
    </View>
  );
}
