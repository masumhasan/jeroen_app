import React from "react";
import { Text, View } from "react-native";
import ShoppingItem from "./ShoppingItem";

type Props = {
  title: string;
  items: { name: string; selected: boolean }[];
  onItemToggle: (itemName: string) => void;
};

const CategorySection = ({ title, items, onItemToggle }: Props) => {
  return (
    <View className="mt-6">
      <Text className="text-[15px] font-semibold text-gray-800 mb-3">
        {title} ({items.length})
      </Text>

      {items.map((item, index) => (
        <ShoppingItem
          key={`${item.name}-${index}`}
          name={item.name}
          selected={item.selected}
          onToggle={() => onItemToggle(item.name)}
        />
      ))}
    </View>
  );
};

export default CategorySection;
