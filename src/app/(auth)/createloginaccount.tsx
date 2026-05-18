import { router } from "expo-router";
import React from "react";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";

const createloginaccount = () => {
  return (
    <ImageBackground
      source={require("../../../assets/appimage/bg-splash.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 justify-center pt-20">
        {/* Logo */}
        <View className="items-center mb-10">
          <Image
            source={require("../../../assets/appimage/logo.png")}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View className="px-6 bg-white/0">
          {/* Title */}
          <Text 
            className="text-[28px] font-bold text-center text-white mb-3"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: -1, height: 1 },
              textShadowRadius: 10
            }}
          >
            {t("createLoginAccount.headline")}
          </Text>

          {/* Subtitle */}
          <Text 
            className="text-white text-center text-[14px] leading-5 mb-8 font-medium"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: -1, height: 1 },
              textShadowRadius: 8
            }}
          >
            {t("createLoginAccount.description")}
          </Text>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={() => router.replace("/createaccountonboading")}
            className="bg-[#8A977B] py-4 rounded-full mb-4"
          >
            <Text className="text-center text-white font-semibold text-[16px]">
              {t("createLoginAccount.createAccount")}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={() => router.replace("/signin")}
            className="bg-white py-4 rounded-full"
          >
            <Text className="text-center text-gray-700 font-semibold text-[16px]">
              {t("createLoginAccount.login")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default createloginaccount;
