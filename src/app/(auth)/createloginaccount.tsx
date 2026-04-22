import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const createloginaccount = () => {
  return (
    <View className="flex-1 bg-white justify-between">
      {/* Top Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        }}
        className="w-full h-[420px] rounded-b-3xl"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="px-6 pb-10">
        {/* Title */}
        <Text className="text-[28px] font-bold text-center text-black mb-3">
          AI-Powered Meal{"\n"}Planning for You
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-500 text-center text-[14px] leading-5 mb-8">
          Personalized nutrition plans tailored to your{"\n"}
          goals, preferences, and lifestyle.
        </Text>

        {/* Create Account Button */}
        <TouchableOpacity
          onPress={() => router.replace("/createaccountonboading")}
          className="bg-[#8A977B] py-4 rounded-full mb-4"
        >
          <Text className="text-center text-white font-semibold text-[16px]">
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => router.replace("/signin")}
          className="border border-gray-300 py-4 rounded-full"
        >
          <Text className="text-center text-gray-700 font-semibold text-[16px]">
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default createloginaccount;
