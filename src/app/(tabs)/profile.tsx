import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const profile = () => {
  const profileData = [
    { label: "Gender", value: "Female" },
    { label: "Height", value: "165 cm" },
    { label: "Weight", value: "62 kg" },
    { label: "Activity Level", value: "Moderately Active" },
    { label: "Goal", value: "Muscle Gain" },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-[5%] ">
        {/* Header */}
        <View className="relative items-center justify-center mb-6">
          <Text className="text-[18px] font-bold text-[#111111]">Profile</Text>

          <TouchableOpacity
            onPress={() => router.push("/setting")}
            className="absolute right-0 top-0"
          >
            <Feather name="settings" size={22} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View className="items-center mb-4">
          <View className="relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
              }}
              className="w-[96px] h-[96px] rounded-full"
              resizeMode="cover"
            />

            <View className="absolute inset-0 rounded-full border-[3px] border-[#89957F]" />

            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#89957F] items-center justify-center border-2 border-white">
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-[20px] font-semibold text-[#111111]">
            Sarah Johnson
          </Text>
          <Text className="mt-1 text-[14px] text-[#89957F]">
            sarah.johnson@email.com
          </Text>
        </View>

        {/* Section Header */}
        <View className="flex-row items-center justify-between mt-3 mb-4">
          <Text className="text-[16px] font-semibold text-[#111111]">
            Personal Information
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/edittheprofile")}
            className="flex-row items-center"
          >
            <Feather name="edit-2" size={15} color="#9BAA84" />
            <Text className="ml-1 text-[14px] text-[#89957F] font-medium">
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View className="gap-3">
          {profileData.map((item, index) => (
            <View
              key={index}
              className="bg-[#F5F5F5] rounded-[16px] px-4 py-5 flex-row items-center justify-between"
            >
              <Text className="text-[15px] text-[#8E8E93]">{item.label}</Text>
              <Text className="text-[15px] font-medium text-[#111111]">
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default profile;
