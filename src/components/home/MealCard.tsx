import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Swap_Lunch from "../modals/Swap_Lunch";
import { t, translateMealType } from "../../i18n";

interface Props {
  recipeId: string;
  title: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  type: string;
  day: string;
  image: string;
  isCrowdsourced?: boolean;
  onMealSwapped?: () => void;
}

export default function MealCard({
  recipeId,
  title,
  calories,
  protein,
  carbs,
  fat,
  type,
  day,
  image,
  isCrowdsourced,
  onMealSwapped,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-5 overflow-hidden">
      <View>
        <Image source={{ uri: image }} className="w-full h-40" />

        <View className="absolute right-3 top-3 bg-white p-2 rounded-full">
          <Ionicons name="lock-closed-outline" size={16} color="#555" />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-gray-400">{translateMealType(type)}</Text>
            {isCrowdsourced && (
              <View className="bg-[#FFF3E0] border border-[#FFE0B2] px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-[#E65100]">{t("mealCard.crowdsourced")}</Text>
              </View>
            )}
          </View>

          <Text className="text-gray-500">
            {calories} <Text className="text-xs">{t("mealCard.cal")}</Text>
          </Text>
        </View>

        <Text className="text-lg font-semibold mt-1">{title}</Text>

        <Text className="text-gray-500 text-sm mt-2">
          P: {protein} C: {carbs} F: {fat}
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="border border-gray-200 rounded-xl py-3 mt-4 items-center"
        >
          <Text className="text-gray-600">{t("mealCard.swapMeal")}</Text>
        </TouchableOpacity>
      </View>

      <Swap_Lunch
        modalVisible={modalVisible}
        setModalVisible={() => setModalVisible(false)}
        currentMeal={{
          recipeId,
          name: title,
          calories: Number(calories) || 0,
          protein: Number((protein || "0").replace("g", "")) || 0,
          carbs: Number((carbs || "0").replace("g", "")) || 0,
          fat: Number((fat || "0").replace("g", "")) || 0,
          image,
        }}
        mealType={type}
        day={day}
        onSwapSuccess={onMealSwapped}
      />
    </View>
  );
}
