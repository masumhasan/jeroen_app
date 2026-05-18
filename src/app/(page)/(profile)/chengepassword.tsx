import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { AlertCircle, Check, Eye, EyeOff, Lock, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../../i18n";

// Types
interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  showStrength?: boolean;
}

interface PasswordRequirements {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// Constants
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 32,
};

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Password Field Component
const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  error,
  showStrength = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: error ? "#FF3B30" : isFocused ? "#98A08C" : "transparent",
    borderWidth: error ? 1 : isFocused ? 1.5 : 0,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.99);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="mb-4"
    >
      <Text className="text-[14px] font-medium text-[#111111] mb-2">
        {label}
      </Text>

      <Animated.View
        style={animatedStyle}
        className="h-[52px] rounded-xl bg-[#F8F8F8] px-4 flex-row items-center"
      >
        <Lock size={18} color="#7A7A7A" strokeWidth={1.8} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-1 ml-3 text-[14px] text-[#111111]"
          maxLength={PASSWORD_REQUIREMENTS.maxLength}
        />

        <AnimatedPressable
          onPress={() => setShowPassword(!showPassword)}
          className="p-2"
        >
          {showPassword ? (
            <EyeOff size={18} color="#7A7A7A" />
          ) : (
            <Eye size={18} color="#7A7A7A" />
          )}
        </AnimatedPressable>
      </Animated.View>

      {error && (
        <Animated.Text
          entering={FadeInDown}
          className="text-[#FF3B30] text-[11px] mt-1 ml-2"
        >
          {error}
        </Animated.Text>
      )}

      {showStrength && value.length > 0 && (
        <PasswordStrengthIndicator password={value} />
      )}
    </Animated.View>
  );
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
  password,
}) => {
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const strengthPercentage = useSharedValue(0);

  useEffect(() => {
    const newRequirements = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    setRequirements(newRequirements);

    const metCount = Object.values(newRequirements).filter(Boolean).length;
    const percentage = (metCount / 5) * 100;
    strengthPercentage.value = withTiming(percentage, { duration: 300 });
  }, [password]);

  const getStrengthColor = () => {
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount <= 2) return "#FF3B30";
    if (metCount <= 3) return "#FFA500";
    if (metCount <= 4) return "#4CD964";
    return "#1BC47D";
  };

  const getStrengthText = () => {
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount <= 2) return t("changePassword.strength.weak");
    if (metCount <= 3) return t("changePassword.strength.fair");
    if (metCount <= 4) return t("changePassword.strength.good");
    return t("changePassword.strength.strong");
  };

  const barStyle = useAnimatedStyle(() => ({
    width: `${strengthPercentage.value}%`,
    backgroundColor: getStrengthColor(),
  }));

  return (
    <Animated.View entering={FadeInUp} className="mt-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[11px] text-[#666666]">
          {t("changePassword.strengthLabel")}{getStrengthText()}
        </Text>
        <Text className="text-[11px] text-[#666666]">
          {Object.values(requirements).filter(Boolean).length}/5
        </Text>
      </View>

      <View className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
        <Animated.View style={barStyle} className="h-full rounded-full" />
      </View>

      <View className="mt-2">
        <RequirementItem
          label={t("changePassword.requirements.minChars", { min: String(PASSWORD_REQUIREMENTS.minLength) })}
          met={requirements.minLength}
        />
        <RequirementItem
          label={t("changePassword.requirements.uppercase")}
          met={requirements.hasUpperCase}
        />
        <RequirementItem
          label={t("changePassword.requirements.lowercase")}
          met={requirements.hasLowerCase}
        />
        <RequirementItem label={t("changePassword.requirements.number")} met={requirements.hasNumber} />
        <RequirementItem
          label={t("changePassword.requirements.special")}
          met={requirements.hasSpecialChar}
        />
      </View>
    </Animated.View>
  );
};

// Requirement Item Component
const RequirementItem: React.FC<{ label: string; met: boolean }> = ({
  label,
  met,
}) => {
  return (
    <Animated.View
      entering={SlideInRight}
      className="flex-row items-center mb-1"
    >
      {met ? (
        <Check size={12} color="#4CD964" />
      ) : (
        <X size={12} color="#FF3B30" />
      )}
      <Text
        className={`text-[10px] ml-2 ${met ? "text-[#4CD964]" : "text-[#FF3B30]"}`}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

// Main Component
const ChangePassword: React.FC = () => {
  // State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const headerScale = useSharedValue(1);
  const saveButtonScale = useSharedValue(1);
  const successScale = useSharedValue(0);

  // Validation
  const validatePasswords = (): boolean => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!oldPassword) {
      newErrors.oldPassword = t("changePassword.errors.oldRequired");
    }

    if (!newPassword) {
      newErrors.newPassword = t("changePassword.errors.newRequired");
    } else {
      if (newPassword.length < PASSWORD_REQUIREMENTS.minLength) {
        newErrors.newPassword = t("changePassword.errors.tooShort", { min: String(PASSWORD_REQUIREMENTS.minLength) });
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword = t("changePassword.errors.noUppercase");
      } else if (!/[a-z]/.test(newPassword)) {
        newErrors.newPassword = t("changePassword.errors.noLowercase");
      } else if (!/[0-9]/.test(newPassword)) {
        newErrors.newPassword = t("changePassword.errors.noNumber");
      } else if (!/[!@#$%^&*]/.test(newPassword)) {
        newErrors.newPassword = t("changePassword.errors.noSpecial");
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("changePassword.errors.confirmRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("changePassword.errors.mismatch");
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword = t("changePassword.errors.sameAsOld");
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handlers
  const handleSave = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      successScale.value = withSpring(1);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        successScale.value = 0;
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert(t("changePassword.alerts.successTitle"), t("changePassword.alerts.successMessage"));
      }, 1500);
    } catch (error) {
      Alert.alert(t("changePassword.alerts.errorTitle"), t("changePassword.alerts.changeFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (oldPassword || newPassword || confirmPassword) {
      Alert.alert(
        t("changePassword.discardTitle"),
        t("changePassword.discardMessage"),
        [
          { text: t("changePassword.stay"), style: "cancel" },
          { text: t("changePassword.leave"), onPress: () => router.back() },
        ],
      );
    } else {
      router.back();
    }
  };

  // Animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  // Animation handlers
  const handleHeaderPressIn = () => {
    headerScale.value = withSpring(0.95);
  };

  const handleHeaderPressOut = () => {
    headerScale.value = withSpring(1);
  };

  const handleSavePressIn = () => {
    saveButtonScale.value = withSpring(0.95);
  };

  const handleSavePressOut = () => {
    saveButtonScale.value = withSpring(1);
  };

  const isFormValid = () => {
    return (
      oldPassword.length > 0 &&
      newPassword.length >= PASSWORD_REQUIREMENTS.minLength &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword &&
      oldPassword !== newPassword &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*]/.test(newPassword)
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-4 pt-2">
              {/* Header */}
              <Animated.View
                style={headerAnimatedStyle}
                className="flex-row items-center justify-between mb-8"
              >
                <AnimatedPressable
                  onPress={handleGoBack}
                  onPressIn={handleHeaderPressIn}
                  onPressOut={handleHeaderPressOut}
                  className="w-8 h-8 items-center justify-center"
                >
                  <FontAwesome6
                    name="arrow-left-long"
                    size={20}
                    color="#0F0B18"
                  />
                </AnimatedPressable>

                <Text className="text-[20px] font-semibold text-[#111111]">
                  {t("changePassword.title")}
                </Text>

                <View className="w-8" />
              </Animated.View>

              {/* Info Message */}
              <Animated.View
                entering={FadeInDown.delay(200)}
                className="bg-[#F8F8F8] p-4 rounded-xl mb-6 flex-row items-center"
              >
                <AlertCircle size={20} color="#98A08C" />
                <Text className="text-[12px] text-[#666666] ml-3 flex-1">
                  {t("changePassword.description")}
                </Text>
              </Animated.View>

              {/* Password Fields */}
              <PasswordField
                label={t("changePassword.oldPasswordLabel")}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder={t("changePassword.enterCurrentPassword")}
                error={errors.oldPassword}
              />

              <PasswordField
                label={t("changePassword.newPasswordLabel")}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t("changePassword.enterNewPassword")}
                error={errors.newPassword}
                showStrength={true}
              />

              <PasswordField
                label={t("changePassword.confirmPasswordLabel")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("changePassword.confirmNewPassword")}
                error={errors.confirmPassword}
              />

              <View className="flex-1" />

              {/* Save Button */}
              <AnimatedPressable
                style={saveButtonAnimatedStyle}
                onPress={handleSave}
                onPressIn={handleSavePressIn}
                onPressOut={handleSavePressOut}
                disabled={isLoading || !isFormValid()}
                className={`h-[52px] rounded-xl items-center justify-center mb-5 ${
                  isLoading || !isFormValid() ? "bg-[#C0C7B6]" : "bg-[#98A08C]"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px] font-semibold">
                    {t("changePassword.updateButton")}
                  </Text>
                )}
              </AnimatedPressable>

              {/* Success Overlay */}
              {showSuccess && (
                <Animated.View
                  style={successAnimatedStyle}
                  className="absolute inset-0 bg-white/95 items-center justify-center"
                >
                  <View className="w-20 h-20 rounded-full bg-[#4CD964] items-center justify-center">
                    <Check size={40} color="#FFFFFF" />
                  </View>
                  <Text className="text-[18px] font-semibold text-[#111111] mt-4">
                    {t("changePassword.successTitle")}
                  </Text>
                  <Text className="text-[14px] text-[#666666] mt-2">
                    {t("changePassword.successMessage")}
                  </Text>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ChangePassword;
