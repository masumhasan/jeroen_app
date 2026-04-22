import { AppImages } from "@/assets/appimage/appimages";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animation values
  const buttonScale = useSharedValue(1);
  const emailFocus = useSharedValue(0);
  const passwordFocus = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: isLoading ? 0.7 : 1,
  }));

  const emailInputStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderColor: emailError
      ? withTiming("#EF4444")
      : withTiming(emailFocus.value ? "#7C866E" : "transparent"),
    transform: [
      {
        translateX: shakeAnimation.value,
      },
    ],
  }));

  const passwordInputStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderColor: passwordError
      ? withTiming("#EF4444")
      : withTiming(passwordFocus.value ? "#7C866E" : "transparent"),
    transform: [
      {
        translateX: shakeAnimation.value,
      },
    ],
  }));

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      // Trigger shake animation
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    router.replace("/home");

    // Button press animation
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1, {}, (finished) => {
        if (finished) {
          runOnJS(performLogin)();
        }
      }),
    );
  };

  const performLogin = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to home or dashboard
      // router.replace("/(tabs)");
    }, 2000);
  };

  const handleEmailFocus = () => {
    emailFocus.value = withTiming(1, { duration: 300 });
  };

  const handleEmailBlur = () => {
    emailFocus.value = withTiming(0, { duration: 300 });
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email");
    }
  };

  const handlePasswordFocus = () => {
    passwordFocus.value = withTiming(1, { duration: 300 });
  };

  const handlePasswordBlur = () => {
    passwordFocus.value = withTiming(0, { duration: 300 });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-20">
            {/* Logo Animation */}
            <Animated.View
              entering={FadeInDown.delay(200)
                .duration(1000)
                .springify()
                .damping(12)}
            >
              <Image
                source={AppImages.logo}
                className="w-24 h-24 mx-auto mb-5"
                resizeMode="contain"
              />
            </Animated.View>

            {/* Title Animation */}
            <Animated.Text
              entering={FadeInDown.delay(400).duration(800).springify()}
              className="text-center text-3xl font-bold text-gray-800 mb-2"
            >
              Welcome Back
            </Animated.Text>

            {/* Subtitle Animation */}
            <Animated.Text
              entering={FadeInDown.delay(600).duration(800).springify()}
              className="text-center text-gray-500 mb-10"
            >
              Sign in to continue to your Meal Planning
            </Animated.Text>

            {/* Email Input Animation */}
            <Text className="text-[#0F0B18] mb-2 font-Inter text-base">
              Email
            </Text>
            <Animated.View
              entering={FadeInUp.delay(800).duration(800).springify()}
            >
              <Animated.View
                // style={emailInputStyle}
                className="bg-[#F1F1F2] rounded-xl px-4 py-2 mb-2 flex-row items-center"
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? "#EF4444" : "#9CA3AF"}
                />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="ml-3 flex-1 text-gray-700 text-base"
                />
              </Animated.View>
              {emailError ? (
                <Animated.Text
                  entering={FadeInDown.duration(300)}
                  className="text-red-500 text-xs mb-3 ml-2"
                >
                  {emailError}
                </Animated.Text>
              ) : null}
            </Animated.View>

            <Text className="text-[#0F0B18] mb-2 font-Inter text-base">
              Password
            </Text>
            {/* Password Input Animation */}
            <Animated.View
              entering={FadeInUp.delay(1000).duration(800).springify()}
            >
              <Animated.View
                // style={passwordInputStyle}
                className="bg-[#F1F1F2] border-none rounded-xl px-4 py-2 mb-2 flex-row items-center"
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordError ? "#EF4444" : "#9CA3AF"}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!showPassword}
                  className="ml-3 flex-1 text-gray-700 text-base "
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </Animated.View>
              {passwordError ? (
                <Animated.Text
                  entering={FadeInDown.duration(300)}
                  className="text-red-500 text-xs mb-3 ml-2"
                >
                  {passwordError}
                </Animated.Text>
              ) : null}
            </Animated.View>

            {/* Forgot Password Animation */}
            <Animated.View
              entering={FadeInUp.delay(1200).duration(800).springify()}
              className="items-end mb-8"
            >
              <TouchableOpacity onPress={() => router.push("/forgot")}>
                <Text className="text-[#7C866E] text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Button Animation */}
            <Animated.View
              entering={FadeInUp.delay(1400).duration(800).springify()}
            >
              <AnimatedTouchableOpacity
                style={buttonAnimatedStyle}
                className="bg-[#7C866E] py-4 rounded-xl shadow-lg"
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    Sign In
                  </Text>
                )}
              </AnimatedTouchableOpacity>
            </Animated.View>

            {/* Divider Animation */}
            <Animated.View
              entering={FadeInUp.delay(1600).duration(800).springify()}
              className="flex-row items-center justify-center my-6"
            >
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </Animated.View>

            {/* Sign Up Link Animation */}
            <Animated.View
              entering={FadeInUp.delay(2000).duration(800).springify()}
              className="flex-row items-center justify-center gap-2 mb-4"
            >
              <Text className="text-center text-gray-500">
                {`Don't have an account?`}
              </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-center text-[#7C866E] font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;
