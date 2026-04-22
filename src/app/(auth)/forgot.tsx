import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Forgot = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Scale animation
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

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <Text className="text-2xl font-semibold text-gray-800 mb-4">
          Email Confirmation
        </Text>

        <Text className="text-gray-400 mb-10">
          Enter Your email for verification.
        </Text>

        <Animated.View
          className="bg-gray-100 rounded-xl px-4 py-3 mb-6 flex-row items-center"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons name="mail-outline" size={18} color="gray" />
          <TextInput
            placeholder="name@example.com"
            className="ml-3 flex-1"
            placeholderTextColor="#9CA3AF"
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
            onPress={() => router.replace("/varify")}
          >
            <Text className="text-white text-center font-semibold">
              Send Verification Code
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Forgot;
