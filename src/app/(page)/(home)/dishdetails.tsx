import CircleGraph from "@/src/components/home/linkpage/dish/CercleGraph";
import DeatilsFull from "@/src/components/home/linkpage/dish/DeatilsFull";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const DishDetails = () => {
  return (
    <View className="flex-1 bg-[#F2F2F2]">
      {/* Top Image */}
      <View className="relative">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea",
          }}
          className="w-full h-[320px]"
          resizeMode="cover"
        />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        {/* Heart Button */}
        <TouchableOpacity className="absolute top-14 right-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center">
          <Feather name="heart" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View className="bg-[#FFFFFF] px-6 pb-10 rounded-t-[25px] -mt-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Title */}
          <Text className="text-[26px] font-bold text-[#222] mt-4">
            Mixed Nuts & Berries
          </Text>

          {/* Info */}
          <View className="flex-row mt-4 items-center gap-3 space-x-6">
            <View className="flex-row items-center">
              <Feather name="clock" size={16} color="#777" />
              <Text className="ml-2 text-[#777]">0 min</Text>
            </View>

            <View className="flex-row items-center">
              <Feather name="users" size={16} color="#777" />
              <Text className="ml-2 text-[#777]">1 serving</Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={() => router.push("/cookinfmode")}
            className="mt-8 bg-[#8F9B87] py-4 rounded-full flex-row items-center justify-center"
          >
            <Feather name="play" size={18} color="white" />
            <Text className="text-white text-[16px] font-semibold ml-2">
              Start Cooking Mode
            </Text>
          </TouchableOpacity>

          <Text className="text-[20px] font-bold text-[#222] mt-4">
            Nutrition Breakdown
          </Text>

          {/* graph */}
          <CircleGraph />

          <DeatilsFull />
        </ScrollView>
      </View>
    </View>
  );
};

export default DishDetails;
