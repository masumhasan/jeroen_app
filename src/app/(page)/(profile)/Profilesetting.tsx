import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, ChevronLeft, Save, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../../services/authService";
import { AppImages } from "../../../../assets/appimage/appimages";

// Types
interface ProfileData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  avatar: string | number;
  email?: string;
  dateOfBirth?: string;
}

// Constants
const DEFAULT_AVATAR = AppImages.userAvatar;
const COUNTRY_CODE = "+1";

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Editable Input Field Component
const EditableInputField = ({
  label,
  value,
  icon,
  onChangeText,
  placeholder = "",
  keyboardType = "default",
  maxLength,
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "email-address" | "numeric";
  maxLength?: number;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: isFocused ? "#98A08C" : "transparent",
    borderWidth: isFocused ? 1.5 : 0,
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
      className="mb-5"
    >
      <Text className="text-[14px] font-medium text-[#111111] mb-2">
        {label}
      </Text>
      <Animated.View
        style={animatedStyle}
        className="h-[52px] rounded-xl bg-[#F8F8F8] px-4 flex-row items-center"
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          className="flex-1 text-[14px] text-[#111111]"
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
        />
      </Animated.View>
    </Animated.View>
  );
};

// Main Component
const ProfileSetting: React.FC = () => {
  // State
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "Sarah",
    lastName: "Jones",
    mobileNumber: "8312024",
    avatar: DEFAULT_AVATAR,
    email: "sarah.jones@example.com",
    dateOfBirth: "1995-06-15",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<ProfileData>(profileData);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Animation values
  const headerScale = useSharedValue(1);
  const saveButtonScale = useSharedValue(1);
  const avatarScale = useSharedValue(1);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const user = await authService.getMe();
        const formattedData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          mobileNumber: user.phoneNumber || "",
          avatar: user.avatar || DEFAULT_AVATAR,
          email: user.email || "",
          dateOfBirth: user.dateOfBirth || "",
        };
        setProfileData(formattedData);
        setOriginalData(formattedData);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Check for changes
  useEffect(() => {
    const hasUnsavedChanges =
      profileData.firstName !== originalData.firstName ||
      profileData.lastName !== originalData.lastName ||
      profileData.mobileNumber !== originalData.mobileNumber ||
      profileData.email !== originalData.email ||
      profileData.dateOfBirth !== originalData.dateOfBirth ||
      profileData.avatar !== originalData.avatar;

    setHasChanges(hasUnsavedChanges);
  }, [profileData, originalData]);

  // Validation
  const validateForm = (): boolean => {
    if (!profileData.firstName.trim()) {
      Alert.alert("Validation Error", "First name is required");
      return false;
    }
    if (!profileData.lastName.trim()) {
      Alert.alert("Validation Error", "Last name is required");
      return false;
    }
    if (!profileData.mobileNumber.trim()) {
      Alert.alert("Validation Error", "Mobile number is required");
      return false;
    }
    if (!/^\d+$/.test(profileData.mobileNumber)) {
      Alert.alert("Validation Error", "Mobile number must contain only digits");
      return false;
    }
    if (
      profileData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)
    ) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  // Handlers
  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const updatePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.mobileNumber,
        email: profileData.email,
        // Add other fields if necessary
      };

      await authService.updateProfile(updatePayload);

      setOriginalData(profileData);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarPress = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to change profile picture",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);

        // Simulate upload
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProfileData((prev) => ({
          ...prev,
          avatar: result.assets[0].uri,
        }));

        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to change profile picture");
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setProfileData(originalData);
          },
        },
      ],
    );
  };

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", onPress: () => router.back() },
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

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
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

  const handleAvatarPressIn = () => {
    avatarScale.value = withSpring(0.95);
  };

  const handleAvatarPressOut = () => {
    avatarScale.value = withSpring(1);
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
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-4 pt-2">
              {/* Header */}
              <Animated.View
                style={headerAnimatedStyle}
                className="flex-row items-center justify-between mb-6"
              >
                <AnimatedPressable
                  onPress={handleGoBack}
                  onPressIn={handleHeaderPressIn}
                  onPressOut={handleHeaderPressOut}
                  className="w-8 h-8 items-center justify-center"
                >
                  <ChevronLeft size={22} color="#111111" />
                </AnimatedPressable>

                <Text className="text-[20px] font-semibold text-[#111111]">
                  Edit Profile
                </Text>

                {hasChanges && (
                  <TouchableOpacity onPress={handleDiscard}>
                    <Text className="text-[#98A08C] text-[14px] font-medium">
                      Reset
                    </Text>
                  </TouchableOpacity>
                )}
                {!hasChanges && <View className="w-8" />}
              </Animated.View>

              {/* Avatar */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                className="items-center mb-8"
              >
                <AnimatedPressable
                  onPress={handleAvatarPress}
                  onPressIn={handleAvatarPressIn}
                  onPressOut={handleAvatarPressOut}
                  style={avatarAnimatedStyle}
                  disabled={isLoading}
                >
                  <View className="relative">
                    <Image
                      source={typeof profileData.avatar === "string" ? { uri: profileData.avatar } : profileData.avatar}
                      className="w-[90px] h-[90px] rounded-full"
                    />

                    {isLoading && (
                      <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                        <ActivityIndicator color="#FFFFFF" />
                      </View>
                    )}

                    <Animated.View
                      entering={FadeInUp}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#98A08C] items-center justify-center border-2 border-white"
                    >
                      <Camera size={16} color="#FFFFFF" />
                    </Animated.View>
                  </View>
                </AnimatedPressable>

                <Text className="text-[12px] text-[#9A9A9A] mt-2">
                  Tap to change profile photo
                </Text>
              </Animated.View>

              {/* Form Fields - Direct Editing */}
              <View className="mb-6">
                <EditableInputField
                  label="First Name"
                  value={profileData.firstName}
                  icon={<User size={16} color="#7A7A7A" strokeWidth={1.8} />}
                  onChangeText={(text) => handleFieldChange("firstName", text)}
                  placeholder="Enter first name"
                  maxLength={20}
                  autoCapitalize="words"
                />

                <EditableInputField
                  label="Last Name"
                  value={profileData.lastName}
                  icon={<User size={16} color="#7A7A7A" strokeWidth={1.8} />}
                  onChangeText={(text) => handleFieldChange("lastName", text)}
                  placeholder="Enter last name"
                  maxLength={20}
                  autoCapitalize="words"
                />

                <EditableInputField
                  label="Email Address"
                  value={profileData.email || ""}
                  icon={<Text className="text-[#7A7A7A] text-[16px]">@</Text>}
                  onChangeText={(text) => handleFieldChange("email", text)}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <EditableInputField
                  label="Mobile Number"
                  value={profileData.mobileNumber}
                  icon={
                    <View className="flex-row items-center">
                      <Text className="text-[16px] mr-1">🇺🇸</Text>
                      <Text className="text-[#7A7A7A] mr-1 text-[14px]">
                        {COUNTRY_CODE}
                      </Text>
                    </View>
                  }
                  onChangeText={(text) =>
                    handleFieldChange("mobileNumber", text)
                  }
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              {/* Save Button */}
              <AnimatedPressable
                style={saveButtonAnimatedStyle}
                onPress={handleSave}
                onPressIn={handleSavePressIn}
                onPressOut={handleSavePressOut}
                disabled={isSaving || !hasChanges}
                className={`h-[52px] rounded-xl items-center justify-center mt-4 ${
                  isSaving || !hasChanges ? "bg-[#C0C7B6]" : "bg-[#98A08C]"
                }`}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View className="flex-row items-center">
                    <Save size={20} color="#FFFFFF" />
                    <Text className="text-white text-[16px] font-semibold ml-2">
                      Save Changes
                    </Text>
                  </View>
                )}
              </AnimatedPressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ProfileSetting;
