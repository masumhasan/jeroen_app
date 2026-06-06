import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import { t } from "../../i18n";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";
import { useFocusEffect } from "@react-navigation/native";
import { resolveAvatarUrl } from "../../utils/imageUrl";

import { AppImages } from "../../../assets/appimage/appimages";

const profile = () => {
  const [userData, setUserData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showWeightModal, setShowWeightModal] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [savingWeight, setSavingWeight] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

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
      Alert.alert(t("profile.alerts.invalidWeight"), t("profile.alerts.invalidWeightMessage"));
      return;
    }

    try {
      setSavingWeight(true);
      const updatedUser = await authService.updateWeight(parsed);
      setUserData(updatedUser);
      setShowWeightModal(false);
      Alert.alert(t("profile.alerts.successTitle"), t("profile.alerts.weightUpdated"));
    } catch (error) {
      console.error("Failed to update weight:", error);
      Alert.alert(t("profile.alerts.errorTitle"), t("profile.alerts.weightFailed"));
    } finally {
      setSavingWeight(false);
    }
  };

  const handleAvatarPress = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("profileSettings.alerts.permissionTitle"), t("profileSettings.alerts.permissionMessage"));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        try {
          const asset = result.assets[0];
          const avatarPath = await authService.uploadAvatar({
            uri: asset.uri,
            mimeType: asset.mimeType,
            fileName: asset.fileName,
          });
          setUserData((prev: any) => ({ ...prev, avatar: avatarPath }));
        } catch (err: any) {
          console.error('[profile] avatar upload failed:', err?.message ?? err);
          Alert.alert(t("profileSettings.alerts.errorTitle"), t("profileSettings.alerts.pictureFailed"));
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (err: any) {
      console.error('[profile] image picker error:', err?.message ?? err);
      Alert.alert(t("profileSettings.alerts.errorTitle"), t("profileSettings.alerts.pictureFailed"));
    }
  };

  const profileData = [
    { label: t("profile.gender"), value: userData?.gender || t("profile.notSet") },
    { label: t("profile.height"), value: userData?.height ? `${userData.height} ${t("profile.cm")}` : t("profile.notSet") },
    { label: t("profile.weight"), value: currentWeight ? `${currentWeight} ${t("profile.kg")}` : t("profile.notSet") },
    { label: t("profile.activityLevel"), value: userData?.activityLevel || t("profile.notSet") },
    { label: t("profile.goal"), value: userData?.goal || t("profile.notSet") },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="px-[5%] pt-0">
        {/* Header */}
        <View className="relative items-center justify-center mb-6">
          <Text className="text-[18px] font-bold text-[#111111]">{t("profile.title")}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-[5%]"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Image */}
        <View className="items-center mb-4">
          <View className="relative">
            <Image
              source={
                resolveAvatarUrl(userData?.avatar)
                  ? { uri: resolveAvatarUrl(userData?.avatar)! }
                  : AppImages.userAvatar
              }
              className="w-[96px] h-[96px] rounded-full"
              resizeMode="cover"
            />

            {uploadingAvatar && (
              <View className="absolute inset-0 rounded-full bg-black/40 items-center justify-center">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}

            <View className="absolute inset-0 rounded-full border-[3px] border-[#89957F]" />

            <TouchableOpacity
              onPress={handleAvatarPress}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#89957F] items-center justify-center border-2 border-white"
            >
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
                    {t("profile.currentWeight")}
                  </Text>
                  <Text className="text-[30px] leading-[34px] font-bold text-[#111111]">
                    {currentWeight ?? "--"}{" "}
                    <Text className="text-[18px]">kg</Text>
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-[#8E8E93] font-medium uppercase">
                    {t("profile.entryWeight")}
                  </Text>
                  <Text className="text-[30px] leading-[34px] font-bold text-[#111111]">
                    {startWeight ?? "--"} <Text className="text-[18px]">kg</Text>
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={openWeightModal}>
              <Text className="text-[15px] text-[#89957F] font-semibold">{t("profile.update")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Header */}
        <View className="flex-row items-center justify-between mt-3 mb-4">
          <Text className="text-[16px] font-semibold text-[#111111]">
            {t("profile.personalInfo")}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/edittheprofile")}
            className="flex-row items-center"
          >
            <Feather name="edit-2" size={15} color="#9BAA84" />
            <Text className="ml-1 text-[14px] text-[#89957F] font-medium">
              {t("profile.edit")}
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
              {t("profile.customizeTarget")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/myfavourites")}
            className="bg-[#F5F5F5] rounded-[16px] px-4 py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="heart" size={18} color="#E53E3E" />
              <Text className="text-[15px] text-[#8E8E93] ml-2">
                {t("profile.myFavourites")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/addrecipe")}
            className="bg-[#89957F] rounded-[16px] px-4 py-5 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="text-[15px] text-white font-semibold ml-2">
              {t("profile.addRecipe")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/myrecipes")}
            className="bg-[#F5F5F5] rounded-[16px] px-4 py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="restaurant-outline" size={18} color="#89957F" />
              <Text className="text-[15px] text-[#8E8E93] ml-2">
                {t("profile.myRecipes")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/setting")}
            className="bg-[#F5F5F5] rounded-[16px] px-4 py-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Feather name="settings" size={18} color="#89957F" />
              <Text className="text-[15px] text-[#8E8E93] ml-2">
                {t("settings.title")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[24px] px-5 pt-5 pb-8 border-t border-[#ECEFE8]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] font-bold text-[#111111]">{t("profile.updateWeight")}</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text className="text-[15px] text-[#89957F] font-semibold">{t("finalPage.cancel")}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 rounded-[14px] bg-[#F5F5F5] border border-[#E7E9E3] px-3 py-3">
                <Text className="text-[11px] text-[#8E8E93] uppercase mb-1">{t("profile.current")}</Text>
                <Text className="text-[24px] font-bold text-[#111111]">
                  {currentWeight ?? "--"} {t("profile.kg")}
                </Text>
              </View>
              <View className="flex-1 rounded-[14px] bg-[#F5F5F5] border border-[#E7E9E3] px-3 py-3">
                <Text className="text-[11px] text-[#8E8E93] uppercase mb-1">{t("profile.entry")}</Text>
                <Text className="text-[24px] font-bold text-[#111111]">
                  {startWeight ?? "--"} {t("profile.kg")}
                </Text>
              </View>
            </View>

            <Text className="text-[12px] text-[#8E8E93] uppercase mb-2">{t("profile.newCurrentWeight")}</Text>
            <View className="rounded-[14px] bg-[#F9F9F9] border border-[#E7E9E3] px-4 py-1 mb-5">
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder={t("profile.weightPlaceholder")}
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
                  {t("profile.saveWeight")}
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
