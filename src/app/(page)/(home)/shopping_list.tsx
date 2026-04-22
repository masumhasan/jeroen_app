import CategorySection from "@/src/components/home/linkpage/CategorySection";
import ProgressHeader from "@/src/components/home/linkpage/ProgressHeader";
import { useShoppingList } from "@/src/hooks/useShoppingList";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ShoppingList = () => {
  // Changed from shopping_list to ShoppingList
  const categories = [
    {
      title: "Vegetables",
      items: [
        "Mixed salad greens (300g)",
        "Cherry tomatoes (200g)",
        "Cucumber (2)",
        "Broccoli (200g)",
        "Asparagus (200g)",
        "Sweet potato (300g)",
        "Red onion (1)",
      ],
    },
    {
      title: "Meat & Fish",
      items: ["Chicken breast (400g)", "Salmon fillet (400g)", "Eggs (12)"],
    },
    {
      title: "Dairy",
      items: ["Feta cheese (60g)", "Milk (1L)"],
    },
    {
      title: "Grains & Bread",
      items: [
        "Whole grain bread (1 loaf)",
        "Brown rice (500g)",
        "Quinoa (250g)",
      ],
    },
  ];

  const {
    selectedCount,
    totalItems,
    progressPercentage,
    toggleItem,
    getItemsByCategory,
    resetSelection,
  } = useShoppingList(categories);

  return (
    <ScrollView className="flex-1 bg-[#F7F7F7] px-5 pt-14">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#0F0B18" />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-center flex-1">
          Shopping List
        </Text>
        {selectedCount > 0 && (
          <TouchableOpacity
            onPress={resetSelection}
            className="bg-gray-200 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-600 text-sm">Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ProgressHeader
        selectedCount={selectedCount}
        totalItems={totalItems}
        progressPercentage={progressPercentage}
      />

      {categories.map((category) => (
        <CategorySection
          key={category.title}
          title={category.title}
          items={getItemsByCategory(category.title)}
          onItemToggle={toggleItem}
        />
      ))}

      {/* Completion Message */}
      {selectedCount === totalItems && totalItems > 0 && (
        <View className="mt-6 p-4 bg-green-100 rounded-xl">
          <Text className="text-[#89957F] text-center font-semibold">
            {`  🎉 Congratulations! You've completed your shopping list!`}
          </Text>
        </View>
      )}

      <TouchableOpacity className="bg-[#89957F] rounded-2xl flex-row justify-center items-center gap-[2%] py-3 mt-[6%]">
        <Feather name="download" size={20} color="#FFFFFF" />
        <Text className="text-[#FFFFFF] font-Inter font-bold text-xl">
          Export List
        </Text>
      </TouchableOpacity>

      <View className="h-40" />
    </ScrollView>
  );
};

export default ShoppingList;
