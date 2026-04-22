import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  selected: boolean;
  onToggle: () => void;
};

const ShoppingItem = ({ name, selected, onToggle }: Props) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 mb-3 active:bg-gray-50"
    >
      <View
        className={`w-5 h-5 rounded-full border mr-3 ${
          selected ? "bg-[#89957F] border-[#89957F]" : "border-gray-400"
        }`}
      >
        {selected && (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-white text-xs">✓</Text>
          </View>
        )}
      </View>

      <Text
        className={`text-[14px] ${selected ? "text-gray-400" : "text-gray-800"}`}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

export default ShoppingItem;
