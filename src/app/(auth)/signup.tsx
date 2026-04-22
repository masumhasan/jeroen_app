import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Signup = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [checkbox, setcheckbox] = useState(false);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, []);

  const handleRegisterPress = () => {
    router.push("/signuponpoarding");
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle registration logic here
    Keyboard.dismiss();
  };

  const handleLoginPress = () => {
    // Smooth navigation with animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => router.push("/signin"));
  };

  const renderInput = (
    field: string,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    secureTextEntry?: boolean,
  ) => (
    <View className="mb-4">
      <Text className="text-[#0F0B18] mb-2 font-Inter text-base">{label}</Text>
      <Animated.View
        className={`bg-gray-100 rounded-xl px-4 py-3 flex-row items-center border-2 ${
          focusedInput === field ? "border-[#7C866E]" : "border-transparent"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={focusedInput === field ? "#7C866E" : "gray"}
        />
        <TextInput
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          className="ml-3 flex-1 text-gray-700"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocusedInput(field)}
          onBlur={() => setFocusedInput(null)}
        />
      </Animated.View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="flex-1 bg-white px-6 pt-14"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-3xl font-bold text-[#7C866E] mb-2">
            Create Account
          </Text>
          <Text className="text-gray-500 mb-8">
            Sign up to get started with our services
          </Text>

          {renderInput("firstName", "First Name", "person-outline", "Sarah")}
          {renderInput("lastName", "Last Name", "person-outline", "Jones")}
          {renderInput("phone", "Phone Number", "call-outline", "+ 02-8312024")}
          {renderInput("email", "Email", "mail-outline", "name@example.com")}
          {renderInput(
            "password",
            "Password",
            "lock-closed-outline",
            "password",
            true,
          )}

          {/* Terms & Conditions */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setcheckbox(!checkbox)}
              className="w-5 h-5 rounded border border-[#9BA593] items-center justify-center"
            >
              {checkbox && (
                <FontAwesome5 name="check" size={10} color="#7C866E" />
              )}
            </TouchableOpacity>
            <Text className="text-sm text-gray-500 ml-2">
              I agree to{" "}
              <Text className="text-[#7C866E] font-semibold">
                Terms & Conditions
              </Text>
            </Text>
          </View>

          {/* Register Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              className="bg-[#7C866E] py-4 rounded-full shadow-lg"
              onPress={handleRegisterPress}
              activeOpacity={0.9}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Register
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-row items-center justify-center mt-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-8 mb-6">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="text-[#7C866E] font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
