import { AppImages } from "@/assets/appimage/appimages";
import DayTabs from "@/src/components/home/DayTabs";
import FooterActions from "@/src/components/home/FooterActions";
import MealCard from "@/src/components/home/MealCard";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-[#FFFFFF]">
      {/* Title */}
      <View className="flex-row items-center justify-between px-[5%] py-4">
        <Image
          source={AppImages.logo}
          className="w-8 h-8  "
          resizeMode="contain"
        />
        <Text className="text-xl font-semibold text-center ">
          Weekly Meal Plan
        </Text>
        <View />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-[5%]">
        {/* Days */}
        <DayTabs />

        {/* Daily total */}
        <View className="bg-gray-100 rounded-xl p-4 flex-row justify-between mt-4">
          <Text className="text-gray-500">Daily Total</Text>
          <Text className="font-semibold text-gray-800">1830 cal</Text>
        </View>

        {/* Meals */}
        <TouchableOpacity onPress={() => router.push("/dishdetails")}>
          <MealCard
            title="Grilled Chicken Salad"
            calories="520"
            protein="45g"
            carbs="38g"
            fat="18g"
            type="LUNCH"
            image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/dishdetails")}>
          <MealCard
            title="Grilled Salmon with Vegetables"
            calories="580"
            protein="42g"
            carbs="45g"
            fat="22g"
            type="DINNER"
            image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2"
          />
        </TouchableOpacity>
        <View className="h-96 w-full" />
      </ScrollView>

      <FooterActions />
    </View>
  );
}
