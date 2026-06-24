import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { t } from "../../i18n";
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
  const [showPassword, setShowPassword] = useState(false);

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

    if (!fn) err.firstName = t("signup.errors.firstNameRequired");
    else if (fn.length < 2) err.firstName = t("signup.errors.firstNameTooShort");

    if (!ln) err.lastName = t("signup.errors.lastNameRequired");
    else if (ln.length < 2) err.lastName = t("signup.errors.lastNameTooShort");

    if (!phone) err.phone = t("signup.errors.phoneRequired");
    else if (phone.length < 8) err.phone = t("signup.errors.phoneTooShort");

    if (!email) err.email = t("signup.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.email = t("signup.errors.emailInvalid");
    }

    if (!password) err.password = t("signup.errors.passwordRequired");
    else if (password.length < 6) err.password = t("signup.errors.passwordTooShort");

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRegisterPress = async () => {
    if (!checkbox) {
      setFieldErrors({ terms: t("signup.errors.termsRequired") });
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

      // Send OTP to the user's email before proceeding
      await authService.sendOtp(formData.email.trim().toLowerCase());

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
        pathname: "/verifyotp",
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
            next.email = t("signup.errors.emailTaken");
          }
          if (data.phoneTaken) {
            next.phone = t("signup.errors.phoneTaken");
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
          general: t("signup.errors.connectionError"),
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
    isPassword?: boolean,
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
            secureTextEntry={isPassword && !showPassword}
            value={formData[field]}
            onChangeText={(text) => {
              setFormData({ ...formData, [field]: text });
              clearFieldError(field);
            }}
            className="ml-3 flex-1 text-gray-700"
            placeholderTextColor="#9CA3AF"
            onFocus={() => setFocusedInput(field)}
            onBlur={() => setFocusedInput(null)}
            autoCapitalize={field === "email" || isPassword ? "none" : "words"}
            keyboardType={field === "phone" ? "phone-pad" : field === "email" ? "email-address" : "default"}
          />
          {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="ml-2 p-1">
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
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
          <Text className="text-3xl font-bold text-[#7C866E] mb-2">{t("signup.title")}</Text>
          <Text className="text-gray-500 mb-8">{t("signup.subtitle")}</Text>

          {renderInput("firstName", t("signup.firstNameLabel"), "person-outline", t("signup.firstNamePlaceholder"))}
          {renderInput("lastName", t("signup.lastNameLabel"), "person-outline", t("signup.lastNamePlaceholder"))}
          {renderInput("phone", t("signup.phoneLabel"), "call-outline", t("signup.phonePlaceholder"))}
          {renderInput("email", t("signup.emailLabel"), "mail-outline", t("signup.emailPlaceholder"))}
          {renderInput("password", t("signup.passwordLabel"), "lock-closed-outline", t("signup.passwordPlaceholder"), true)}

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
                {t("signup.agreeTo")}
                <Text className="text-[#7C866E] font-semibold">{t("signup.termsConditions")}</Text>
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
                <Text className="text-white text-center font-semibold text-lg">{t("signup.registerButton")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-row items-center justify-center mt-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">{t("signup.orContinueWith")}</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="flex-row items-center justify-center mt-8 mb-6">
            <Text className="text-gray-400">{t("signup.haveAccount")}</Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="text-[#7C866E] font-semibold">{t("signup.loginLink")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
