import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Swap_Lunch from "../modals/Swap_Lunch";

interface Props {
  title: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  type: string;
  image: string;
}

export default function MealCard({
  title,
  calories,
  protein,
  carbs,
  fat,
  type,
  image,
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
          <Text className="text-xs text-gray-400">{type}</Text>

          <Text className="text-gray-500">
            {calories} <Text className="text-xs">cal</Text>
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
          <Text className="text-gray-600">↻ Swap Meal</Text>
        </TouchableOpacity>
      </View>

      <Swap_Lunch
        modalVisible={modalVisible}
        setModalVisible={() => setModalVisible(false)}
      />
    </View>
  );
}
