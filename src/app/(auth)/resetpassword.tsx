import { router } from "expo-router";
import { ArrowLeft, Check, Eye, EyeOff, Lock, X } from "lucide-react-native";
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
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
  placeholder = "Enter password",
  error,
  showStrength = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: error ? "#FF3B30" : isFocused ? "#98A08C" : "#F8F8F8",
    borderWidth: error ? 1 : isFocused ? 1.5 : 1,
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
          className="flex-1 ml-3 text-[14px] text-[#111111]"
          maxLength={PASSWORD_REQUIREMENTS.maxLength}
        />

        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className="p-2"
        >
          {showPassword ? (
            <EyeOff size={18} color="#7A7A7A" />
          ) : (
            <Eye size={18} color="#7A7A7A" />
          )}
        </Pressable>
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

  const getStrengthText = () => {
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount <= 2) return "Weak";
    if (metCount <= 3) return "Fair";
    if (metCount <= 4) return "Good";
    return "Strong";
  };

  return (
    <Animated.View entering={FadeInUp} className="mt-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[11px] text-[#666666]">
          Password Strength: {getStrengthText()}
        </Text>
        <Text className="text-[11px] text-[#666666]">
          {Object.values(requirements).filter(Boolean).length}/5
        </Text>
      </View>

      <View className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
        <Animated.View className="h-full rounded-full" />
      </View>

      <View className="mt-2">
        <RequirementItem
          label={`At least ${PASSWORD_REQUIREMENTS.minLength} characters`}
          met={requirements.minLength}
        />
        <RequirementItem
          label="Uppercase letter (A-Z)"
          met={requirements.hasUpperCase}
        />
        <RequirementItem
          label="Lowercase letter (a-z)"
          met={requirements.hasLowerCase}
        />
        <RequirementItem label="Number (0-9)" met={requirements.hasNumber} />
        <RequirementItem
          label="Special character (!@#$%)"
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
const Resetpassword: React.FC = () => {
  // State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const saveButtonScale = useSharedValue(1);
  const successScale = useSharedValue(0);

  // Validation
  const validatePasswords = (): boolean => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      if (newPassword.length < PASSWORD_REQUIREMENTS.minLength) {
        newErrors.newPassword = `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`;
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(newPassword)) {
        newErrors.newPassword = "Password must contain at least one number";
      } else if (!/[!@#$%^&*]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one special character";
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Handlers
  const handleSave = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success animation
      successScale.value = withSequence(withSpring(1.2), withSpring(1));
      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        successScale.value = 0;
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert("Success", "Password changed successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }, 1500);
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation styles
  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const handleSavePressIn = () => {
    saveButtonScale.value = withSpring(0.95);
  };

  const handleSavePressOut = () => {
    saveButtonScale.value = withSpring(1);
  };

  const isFormValid = () => {
    return (
      newPassword.length >= PASSWORD_REQUIREMENTS.minLength &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword &&
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
              {/* Header with Back Button */}
              <View className="flex-row items-center mb-6 mt-[8%]">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                  <ArrowLeft size={24} color="#111111" />
                </Pressable>
                <Text className="text-[20px] font-semibold text-[#111111] ml-2">
                  Reset Password
                </Text>
              </View>

              {/* Info Message */}
              <Animated.View
                entering={FadeInDown.delay(200)}
                className="bg-[#F8F8F8] p-4 rounded-xl mb-6"
              >
                <Text className="text-[14px] text-[#666666]">
                  Create a new password for your account. Make sure to choose a
                  strong and unique password that you haven't used before.
                </Text>
              </Animated.View>

              <PasswordField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                error={errors.newPassword}
                showStrength={true}
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
              />

              <View style={{ height: 20 }} />

              {/* Save Button */}
              <AnimatedPressable
                style={saveButtonAnimatedStyle}
                onPress={handleSave}
                onPressIn={handleSavePressIn}
                onPressOut={handleSavePressOut}
                disabled={isLoading || !isFormValid()}
                className={`h-[52px] rounded-xl items-center justify-center ${
                  isLoading || !isFormValid() ? "bg-[#C0C7B6]" : "bg-[#98A08C]"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px] font-semibold">
                    Update Password
                  </Text>
                )}
              </AnimatedPressable>

              {/* Success Overlay */}
              {showSuccess && (
                <Animated.View
                  style={[
                    successAnimatedStyle,
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View className="w-20 h-20 rounded-full bg-[#4CD964] items-center justify-center">
                    <Check size={40} color="#FFFFFF" />
                  </View>
                  <Text className="text-[18px] font-semibold text-[#111111] mt-4">
                    Password Updated!
                  </Text>
                  <Text className="text-[14px] text-[#666666] mt-2 text-center px-8">
                    Your password has been changed successfully
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

export default Resetpassword;
