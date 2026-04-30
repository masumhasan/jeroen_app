import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";
import { useFocusEffect } from "@react-navigation/native";

import { AppImages } from "../../../assets/appimage/appimages";

const profile = () => {
  const [userData, setUserData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showWeightModal, setShowWeightModal] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [savingWeight, setSavingWeight] = React.useState(false);

  const fetchUserData = async () => {
    try {
      const user = await authService.getMe();
      setUserData(user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const startWeight = userData?.startWeight ?? userData?.weightHistory?.[0]?.weight ?? userData?.weight;
  const currentWeight = userData?.currentWeight ?? userData?.weight;

  const openWeightModal = () => {
    const defaultWeight =
      currentWeight ?? startWeight ?? userData?.weight ?? "";
    setWeightInput(defaultWeight ? String(defaultWeight) : "");
    setShowWeightModal(true);
  };

  const handleSaveWeight = async () => {
    const parsed = Number(weightInput);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 500) {
      Alert.alert("Invalid weight", "Please enter a valid weight in kg.");
      return;
    }

    try {
      setSavingWeight(true);
      const updatedUser = await authService.updateWeight(parsed);
      setUserData(updatedUser);
      setShowWeightModal(false);
      Alert.alert("Success", "Weight updated successfully.");
    } catch (error) {
      console.error("Failed to update weight:", error);
      Alert.alert("Error", "Failed to update weight. Please try again.");
    } finally {
      setSavingWeight(false);
    }
  };

  const profileData = [
    { label: "Gender", value: userData?.gender || "Not set" },
    { label: "Height", value: userData?.height ? `${userData.height} cm` : "Not set" },
    { label: "Weight", value: currentWeight ? `${currentWeight} kg` : "Not set" },
    { label: "Activity Level", value: userData?.activityLevel || "Not set" },
    { label: "Goal", value: userData?.goal || "Not set" },
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
              source={userData?.avatar ? { uri: userData.avatar } : AppImages.userAvatar}
              className="w-[96px] h-[96px] rounded-full"
              resizeMode="cover"
            />

            <View className="absolute inset-0 rounded-full border-[3px] border-[#89957F]" />

            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#89957F] items-center justify-center border-2 border-white">
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#89957F" className="mt-4" />
          ) : (
            <>
              <Text className="mt-4 text-[20px] font-semibold text-[#111111]">
                {userData?.firstName} {userData?.lastName}
              </Text>
              <Text className="mt-1 text-[14px] text-[#89957F]">
                {userData?.email}
              </Text>
            </>
          )}
        </View>

        {/* Weight Summary Card */}
        <View className="mb-5 rounded-[18px] bg-[#F5F5F5] border border-[#E7E9E3] px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-[#E8EEE1] items-center justify-center mr-3">
                <Feather name="activity" size={16} color="#89957F" />
              </View>
              <View className="flex-row gap-7">
                <View>
                  <Text className="text-[11px] text-[#8E8E93] font-medium uppercase">
                    Current Weight
                  </Text>
                  <Text className="text-[30px] leading-[34px] font-bold text-[#111111]">
                    {currentWeight ?? "--"}{" "}
                    <Text className="text-[18px]">kg</Text>
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-[#8E8E93] font-medium uppercase">
                    Entry Weight
                  </Text>
                  <Text className="text-[30px] leading-[34px] font-bold text-[#111111]">
                    {startWeight ?? "--"} <Text className="text-[18px]">kg</Text>
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={openWeightModal}>
              <Text className="text-[15px] text-[#89957F] font-semibold">Update</Text>
            </TouchableOpacity>
          </View>
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

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/finalpage",
                params: { returnTo: "profile" },
              })
            }
            className="bg-[#F5F5F5] rounded-[16px] px-4 py-5 flex-row items-center justify-between"
          >
            <Text className="text-[15px] text-[#8E8E93]">
              Customize Target Consumption
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[24px] px-5 pt-5 pb-8 border-t border-[#ECEFE8]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-[#111111]">Update Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text className="text-[15px] text-[#89957F] font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 rounded-[14px] bg-[#F5F5F5] border border-[#E7E9E3] px-3 py-3">
                <Text className="text-[11px] text-[#8E8E93] uppercase mb-1">Current</Text>
                <Text className="text-[24px] font-bold text-[#111111]">
                  {currentWeight ?? "--"} kg
                </Text>
              </View>
              <View className="flex-1 rounded-[14px] bg-[#F5F5F5] border border-[#E7E9E3] px-3 py-3">
                <Text className="text-[11px] text-[#8E8E93] uppercase mb-1">Entry</Text>
                <Text className="text-[24px] font-bold text-[#111111]">
                  {startWeight ?? "--"} kg
                </Text>
              </View>
            </View>

            <Text className="text-[12px] text-[#8E8E93] uppercase mb-2">New Current Weight</Text>
            <View className="rounded-[14px] bg-[#F9F9F9] border border-[#E7E9E3] px-4 py-1 mb-5">
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="Enter weight in kg"
                className="text-[20px] font-semibold text-[#111111] py-3"
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveWeight}
              disabled={savingWeight}
              className="bg-[#89957F] rounded-[14px] items-center justify-center py-4"
            >
              {savingWeight ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[16px] font-semibold">
                  Save New Weight
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default profile;
