import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { t } from "../../i18n";
import {
  Alert,
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { authService } from "../../services/authService";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handleSend = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert("Fout", "Voer je e-mailadres in.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Fout", "Voer een geldig e-mailadres in.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendForgotOtp(trimmedEmail);
      router.push({ pathname: "/varify", params: { email: trimmedEmail } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Er is iets misgegaan. Probeer het opnieuw.";
      Alert.alert("Fout", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <Text className="text-2xl font-semibold text-gray-800 mb-4">
          {t("forgot.title")}
        </Text>

        <Text className="text-gray-400 mb-10">
          {t("forgot.subtitle")}
        </Text>

        <Animated.View
          className="bg-gray-100 rounded-xl px-4 py-3 mb-6 flex-row items-center"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons name="mail-outline" size={18} color="gray" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("forgot.emailPlaceholder")}
            className="ml-3 flex-1"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ scale: buttonScaleAnim }],
          }}
        >
          <TouchableOpacity
            className="bg-[#7C866E] py-4 rounded-full"
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center font-semibold">
                {t("forgot.sendButton")}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Forgot;
