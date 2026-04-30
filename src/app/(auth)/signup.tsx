import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { authService } from "../../services/authService";

type FormField = "firstName" | "lastName" | "phone" | "email" | "password";

const Signup = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [checkbox, setcheckbox] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
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

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const err: Record<string, string> = {};
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!fn) err.firstName = "First name is required";
    else if (fn.length < 2) err.firstName = "First name must be at least 2 characters";

    if (!ln) err.lastName = "Last name is required";
    else if (ln.length < 2) err.lastName = "Last name must be at least 2 characters";

    if (!phone) err.phone = "Phone number is required";
    else if (phone.length < 8) err.phone = "Phone number is too short";

    if (!email) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.email = "Invalid email address";
    }

    if (!password) err.password = "Password is required";
    else if (password.length < 6) err.password = "Password must be at least 6 characters";

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRegisterPress = async () => {
    if (!checkbox) {
      setFieldErrors({ terms: "Please agree to the Terms & Conditions" });
      return;
    }

    setFieldErrors({});
    if (!validateForm()) return;

    setIsChecking(true);
    try {
      await authService.checkSignupAvailability({
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phone.trim(),
      });

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

      Keyboard.dismiss();

      router.push({
        pathname: "/signuponpoarding",
        params: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string; emailTaken?: boolean; phoneTaken?: boolean } };
      };
      const res = err?.response;
      const data = res?.data;
      if (res?.status === 409 && data) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          if (data.emailTaken) {
            next.email = "An account with this email already exists.";
          }
          if (data.phoneTaken) {
            next.phone = "An account with this phone number already exists.";
          }
          return next;
        });
      } else if (data?.message) {
        const msg = String(data.message);
        if (/email/i.test(msg) && /phone number/i.test(msg)) {
          setFieldErrors({ email: msg, phone: msg });
        } else if (/email/i.test(msg)) {
          setFieldErrors({ email: msg });
        } else if (/phone/i.test(msg)) {
          setFieldErrors({ phone: msg });
        } else {
          setFieldErrors({ general: msg });
        }
      } else {
        setFieldErrors({
          general: "Could not verify your details. Check your connection and try again.",
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleLoginPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => router.push("/signin"));
  };

  const renderInput = (
    field: FormField,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    placeholder: string,
    secureTextEntry?: boolean,
  ) => {
    const error = fieldErrors[field];
    const hasError = Boolean(error);
    return (
      <View className="mb-4">
        <Text className="text-[#0F0B18] mb-2 font-Inter text-base">{label}</Text>
        <Animated.View
          className={`bg-gray-100 rounded-xl px-4 py-3 flex-row items-center border-2 ${
            hasError
              ? "border-red-400"
              : focusedInput === field
                ? "border-[#7C866E]"
                : "border-transparent"
          }`}
        >
          <Ionicons
            name={icon}
            size={18}
            color={hasError ? "#ef4444" : focusedInput === field ? "#7C866E" : "gray"}
          />
          <TextInput
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            value={formData[field]}
            onChangeText={(text) => {
              setFormData({ ...formData, [field]: text });
              clearFieldError(field);
            }}
            className="ml-3 flex-1 text-gray-700"
            placeholderTextColor="#9CA3AF"
            onFocus={() => setFocusedInput(field)}
            onBlur={() => setFocusedInput(null)}
            autoCapitalize={field === "email" ? "none" : "words"}
            keyboardType={field === "phone" ? "phone-pad" : field === "email" ? "email-address" : "default"}
          />
        </Animated.View>
        {hasError ? (
          <Text className="text-red-500 text-sm mt-1.5 ml-0.5">{error}</Text>
        ) : null}
      </View>
    );
  };

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
          <Text className="text-3xl font-bold text-[#7C866E] mb-2">Create Account</Text>
          <Text className="text-gray-500 mb-8">Sign up to get started with our services</Text>

          {renderInput("firstName", "First Name", "person-outline", "John")}
          {renderInput("lastName", "Last Name", "person-outline", "Doe")}
          {renderInput("phone", "Phone Number", "call-outline", "+31 6 12345678")}
          {renderInput("email", "Email", "mail-outline", "name@example.com")}
          {renderInput("password", "Password", "lock-closed-outline", "password", true)}

          <View className="mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  setcheckbox(!checkbox);
                  if (fieldErrors.terms) clearFieldError("terms");
                }}
                className="w-5 h-5 rounded border border-[#9BA593] items-center justify-center"
              >
                {checkbox && <FontAwesome5 name="check" size={10} color="#7C866E" />}
              </TouchableOpacity>
              <Text className="text-sm text-gray-500 ml-2">
                I agree to{" "}
                <Text className="text-[#7C866E] font-semibold">Terms & Conditions</Text>
              </Text>
            </View>
            {fieldErrors.terms ? (
              <Text className="text-red-500 text-sm mt-2">{fieldErrors.terms}</Text>
            ) : null}
          </View>

          {fieldErrors.general ? (
            <Text className="text-red-500 text-sm mb-3 text-center">{fieldErrors.general}</Text>
          ) : null}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              className="bg-[#7C866E] py-4 rounded-full shadow-lg"
              onPress={handleRegisterPress}
              activeOpacity={0.9}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">Register</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-row items-center justify-center mt-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

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
