import DitaryProcess from "@/src/components/auth/DitaryProcess";
import MeelPlan from "@/src/components/auth/MeelPlan";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { authService } from "../../services/authService";
import {
  Alert,
  Dimensions,
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
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

// Types
interface UserData {
  gender: string;
  age: string;
  height: string;
  weight: string;
  activity: string;
  goal: string;
  dietarySelections: {
    dietary: string[];
    ingredients: string[];
    allergies: string;
    targetWeight: string;
  };
  mealPlan: string;
}

// Constants
const PRIMARY = "#89957F";
const PRIMARY_LIGHT = "#F3F5F1";
const PRIMARY_DARK = "#6A7A5C";
const BORDER = "#E7E7E7";
const TEXT_DARK = "#1F1F28";
const TEXT_LIGHT = "#7A7A7A";
const BG = "#FFFFFF";
const ERROR = "#FF3B30";
const SUCCESS = "#34C759";

const ACTIVITY_OPTIONS = [
  {
    id: "sedentary",
    title: "Sedentary",
    subtitle: "Little to no exercise, desk job",
    value: "Sedentary",
    calories: "1,800-2,000",
  },
  {
    id: "moderate",
    title: "Moderate",
    subtitle: "Exercise 3-5 days/week, active lifestyle",
    value: "Moderate",
    calories: "2,200-2,400",
  },
  {
    id: "active",
    title: "Active",
    subtitle: "Exercise 6-7 days/week, physical job",
    value: "Active",
    calories: "2,600-2,800",
  },
  {
    id: "veryActive",
    title: "Very Active",
    subtitle: "Intense exercise daily, athlete",
    value: "Very Active",
    calories: "3,000+",
  },
];

const GOAL_OPTIONS = [
  { id: "weightLoss", title: "Weight Loss", emoji: "⚖️", color: "#89957F" },
  { id: "weightGain", title: "Weight Gain", emoji: "📈", color: "#89957F" },
  { id: "muscleGain", title: "Muscle Gain", emoji: "💪", color: "#89957F" },
  { id: "maintenance", title: "Maintenance", emoji: "🎯", color: "#89957F" },
];

const GENDER_OPTIONS = [
  { id: "male", label: "Male", icon: "male" as const },
  { id: "female", label: "Female", icon: "female" as const },
  { id: "other", label: "Other", icon: "person" as const },
];

const STEPS = [
  { label: "Basic Info", percent: 20, icon: "person" },
  { label: "Activity", percent: 40, icon: "fitness" },
  { label: "Goals", percent: 60, icon: "flag" },
  { label: "Dietary", percent: 80, icon: "restaurant" },
  { label: "Meal Plan", percent: 100, icon: "calendar" },
];

// Progress Header Component
const ProgressHeader: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(STEPS[currentStep].percent, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const stepIndicatorStyle = (index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;

    return useAnimatedStyle(() => ({
      backgroundColor: isCompleted
        ? PRIMARY
        : isCurrent
          ? withTiming(PRIMARY, { duration: 300 })
          : "#E0E0E0",
      transform: [{ scale: isCurrent ? withSpring(1.2) : 1 }],
    }));
  };

  return (
    <View className="px-5 pt-4 pb-2 bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={TEXT_DARK} />
        </TouchableOpacity>

        <View className="flex-row items-center">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.label}>
              <Animated.View></Animated.View>
            </React.Fragment>
          ))}
        </View>

        <View className="w-10" />
      </View>

      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[#98A08C] font-semibold text-sm">
          Step {currentStep + 1} of 5
        </Text>
        <Text className="text-[#89957F] font-bold text-sm">
          {STEPS[currentStep].percent}% Complete
        </Text>
      </View>

      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <Animated.View
          style={[progressStyle, { backgroundColor: PRIMARY }]}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
};

// Input Field Component
const InputField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: error ? ERROR : isFocused ? PRIMARY : BORDER,
    borderWidth: error ? 1.5 : isFocused ? 1.5 : 1,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="mb-4"
    >
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <Animated.View
        style={animatedStyle}
        className="h-[56px] rounded-2xl bg-white px-4 flex-row items-center shadow-sm"
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? PRIMARY : TEXT_LIGHT}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`flex-1 text-base text-gray-800 ${icon ? "ml-3" : ""}`}
        />
        {value.length > 0 && !error && (
          <Ionicons name="checkmark-circle" size={20} color={SUCCESS} />
        )}
      </Animated.View>
      {error && (
        <Animated.Text
          entering={FadeInUp}
          className="text-red-500 text-xs mt-1 ml-2"
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

// Gender Button Component
const GenderButton: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}> = ({ label, icon, active, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: active ? PRIMARY : "white",
    borderColor: active ? PRIMARY : BORDER,
  }));

  return (
    <Animated.View style={{ flex: 1 }}>
      <Animated.View
        style={[animatedStyle]}
        className="rounded-2xl border overflow-hidden"
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => (scale.value = withSpring(0.97))}
          onPressOut={() => (scale.value = withSpring(1))}
          className="h-[56px] items-center justify-center flex-row"
          activeOpacity={0.9}
        >
          <Ionicons
            name={icon}
            size={20}
            color={active ? "#FFFFFF" : TEXT_LIGHT}
          />
          <Text
            className={`text-sm font-medium ml-2 ${
              active ? "text-white" : "text-gray-600"
            }`}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Option Card Component
const OptionCard: React.FC<{
  title: string;
  subtitle: string;
  calories?: string;
  active: boolean;
  onPress: () => void;
  delay?: number;
}> = ({ title, subtitle, calories, active, onPress, delay = 0 }) => {
  const scale = useSharedValue(1);

  return (
    <Animated.View entering={SlideInRight.delay(delay).springify()}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          {
            transform: [{ scale: scale.value }],
            borderWidth: 2,
            borderColor: active ? PRIMARY : BORDER,
            backgroundColor: active ? PRIMARY_LIGHT : "#fff",
          },
        ]}
        className="rounded-2xl p-5 mb-3"
        activeOpacity={0.9}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {title}
            </Text>
            <Text className="text-sm text-gray-500">{subtitle}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Goal Card Component
const GoalCard: React.FC<{
  title: string;
  emoji: string;
  color: string;
  active: boolean;
  onPress: () => void;
  delay?: number;
}> = ({ title, emoji, color, active, onPress, delay = 0 }) => {
  const scale = useSharedValue(1);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={{ width: "48%" }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[
          {
            transform: [{ scale: scale.value }],
            backgroundColor: active ? color : "#F8F8F8",
          },
        ]}
        className="h-32 rounded-2xl items-center justify-center mb-3"
        activeOpacity={0.9}
      >
        <Text className="text-3xl mb-2">{emoji}</Text>
        <Text
          className={`text-sm font-medium ${
            active ? "text-white" : "text-gray-600"
          }`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Continue Button Component
const ContinueButton: React.FC<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ title, onPress, disabled = false, loading = false }) => {
  const scale = useSharedValue(1);

  return (
    <View className="px-5 pb-6 pt-2 bg-white border-t border-gray-100">
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => !disabled && (scale.value = withSpring(0.97))}
        onPressOut={() => !disabled && (scale.value = withSpring(1))}
        disabled={disabled || loading}
        style={[
          {
            transform: [{ scale: scale.value }],
            backgroundColor: disabled ? "#C0C7B6" : PRIMARY,
            height: 56,
            borderRadius: 28,
          },
        ]}
        className="items-center justify-center flex-row shadow-lg"
        activeOpacity={0.9}
      >
        {/* {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text className="text-white text-base font-semibold mr-2">
              {title}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </>
        )} */}
        <>
          <Text className="text-white text-base font-semibold mr-2">
            {title}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </>
      </TouchableOpacity>
    </View>
  );
};

// Validation Functions
const validateBasicInfo = (data: UserData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.gender) errors.gender = "Please select your gender";

  const ageNum = parseInt(data.age);
  if (!data.age) errors.age = "Age is required";
  else if (isNaN(ageNum) || ageNum < 13 || ageNum > 120)
    errors.age = "Please enter a valid age (13-120)";

  const heightNum = parseInt(data.height);
  if (!data.height) errors.height = "Height is required";
  else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250)
    errors.height = "Please enter a valid height (100-250 cm)";

  const weightNum = parseInt(data.weight);
  if (!data.weight) errors.weight = "Weight is required";
  else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300)
    errors.weight = "Please enter a valid weight (30-300 kg)";

  return errors;
};

// Main Component
const Signuponpoarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const swiperRef = useRef<any>(null);

  const [userData, setUserData] = useState<UserData>({
    gender: "",
    age: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
    dietarySelections: {
      dietary: [],
      ingredients: [],
      allergies: "",
      targetWeight: "65",
    },
    mealPlan: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 0) {
      const stepErrors = validateBasicInfo(userData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }

    if (currentStep === 1 && !userData.activity) {
      Alert.alert("Selection Required", "Please select your activity level");
      return;
    }

    if (currentStep === 2 && !userData.goal) {
      Alert.alert("Selection Required", "Please select your fitness goal");
      return;
    }

    setErrors({});

    if (currentStep < 4) {
      swiperRef.current?.scrollBy(1);
    } else {
      // Final submission
      await handleSubmit();
    }
  };

  const { firstName, lastName, phone, email, password } = useLocalSearchParams();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const signupData: any = {
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        password,
      };

      if (userData.gender) signupData.gender = userData.gender;
      
      const ageNum = parseInt(userData.age);
      if (!isNaN(ageNum)) signupData.age = ageNum;
      
      const heightNum = parseInt(userData.height);
      if (!isNaN(heightNum)) signupData.height = heightNum;
      
      const weightNum = parseInt(userData.weight);
      if (!isNaN(weightNum)) signupData.weight = weightNum;
      
      if (userData.activity) signupData.activityLevel = userData.activity;
      if (userData.goal) signupData.goal = userData.goal;
      
      if (userData.dietarySelections.dietary.length > 0) {
        signupData.dietaryRestrictions = userData.dietarySelections.dietary;
      }
      
      if (userData.dietarySelections.ingredients.length > 0) {
        signupData.unwantedIngredients = userData.dietarySelections.ingredients;
      }
      
      if (userData.dietarySelections.allergies) {
        signupData.allergies = [userData.dietarySelections.allergies];
      }
      
      const targetWeightNum = parseInt(userData.dietarySelections.targetWeight);
      if (!isNaN(targetWeightNum)) signupData.targetWeight = targetWeightNum;
      
      if (userData.mealPlan.length > 0) {
        signupData.mealPlanPreferences = userData.mealPlan.map((id: string) => {
          if (id === 'snack-1') return 'Snack-1';
          if (id === 'snack-2') return 'Snack-2';
          if (id === 'snack-3') return 'Snack-3';
          return id;
        });
      }

      await authService.signup(signupData);
      
      router.replace("/finalpage");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = (key: keyof UserData, value: any) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const updateDietarySelections = (selections: any) => {
    setUserData((prev) => ({
      ...prev,
      dietarySelections: selections,
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ProgressHeader currentStep={currentStep} />

        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={false}
          scrollEnabled={false}
          index={0}
          onIndexChanged={setCurrentStep}
        >
          {/* Step 1: Basic Info */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Basic Information
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-500 text-base mb-8"
            >
              Let's start with the basics
            </Animated.Text>

            <Text className="text-sm font-medium text-gray-700 mb-3">
              Gender
            </Text>
            <View className="flex-row gap-3 mb-4">
              {GENDER_OPTIONS.map((gender) => (
                <GenderButton
                  key={gender.id}
                  label={gender.label}
                  icon={gender.icon}
                  active={userData.gender === gender.label}
                  onPress={() => updateUserData("gender", gender.label)}
                />
              ))}
            </View>
            {errors.gender && (
              <Text className="text-red-500 text-xs mb-3 -mt-2 ml-2">
                {errors.gender}
              </Text>
            )}

            <InputField
              label="Age"
              value={userData.age}
              onChangeText={(text) => updateUserData("age", text)}
              placeholder="Enter your age"
              keyboardType="numeric"
              error={errors.age}
              icon="person-outline"
            />

            <InputField
              label="Height (cm)"
              value={userData.height}
              onChangeText={(text) => updateUserData("height", text)}
              placeholder="Enter your height"
              keyboardType="numeric"
              error={errors.height}
              icon="resize-outline"
            />

            <InputField
              label="Weight (kg)"
              value={userData.weight}
              onChangeText={(text) => updateUserData("weight", text)}
              placeholder="Enter your weight"
              keyboardType="numeric"
              error={errors.weight}
              icon="barbell-outline"
            />
          </ScrollView>

          {/* Step 2: Activity Level */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Activity Level
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-500 text-base mb-8"
            >
              This helps us calculate your daily calorie needs
            </Animated.Text>

            {ACTIVITY_OPTIONS.map((option, index) => (
              <OptionCard
                key={option.id}
                title={option.title}
                subtitle={option.subtitle}
                calories={option.calories}
                active={userData.activity === option.value}
                onPress={() => updateUserData("activity", option.value)}
                delay={index * 100}
              />
            ))}
          </ScrollView>

          {/* Step 3: Goals */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            <Animated.Text
              entering={FadeInDown.delay(100)}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Your Goal
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.delay(200)}
              className="text-gray-500 text-base mb-8"
            >
              What would you like to achieve?
            </Animated.Text>

            <View className="flex-row justify-between flex-wrap">
              {GOAL_OPTIONS.map((goal, index) => (
                <GoalCard
                  key={goal.id}
                  title={goal.title}
                  emoji={goal.emoji}
                  color={goal.color}
                  active={userData.goal === goal.title}
                  onPress={() => updateUserData("goal", goal.title)}
                  delay={index * 100}
                />
              ))}
            </View>

            {/* Quick Tip */}
            <Animated.View
              entering={FadeInUp.delay(400)}
              className="mt-6 p-4 bg-[#F3F5F1] rounded-2xl"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="bulb-outline" size={20} color={PRIMARY} />
                <Text className="text-[#89957F] font-semibold ml-2">
                  Quick Tip
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">
                Your goal helps us customize your meal plan and workout
                recommendations for better results.
              </Text>
            </Animated.View>
          </ScrollView>

          {/* Step 4: Dietary Process */}
          <View style={{ flex: 1, backgroundColor: BG }}>
            <DitaryProcess
              value={userData.dietarySelections}
              onChange={updateDietarySelections}
            />
          </View>

          {/* Step 5: Meal Plan */}
          <View style={{ flex: 1, backgroundColor: BG }}>
            <MeelPlan
              value={userData.mealPlan}
              onChange={(value) => updateUserData("mealPlan", value)}
            />
          </View>
        </Swiper>

        <ContinueButton
          title={currentStep < 3 ? "Complete " : "Generate My Plan"}
          onPress={handleNext}
          disabled={
            (currentStep === 1 && !userData.activity) ||
            (currentStep === 2 && !userData.goal)
          }
          loading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signuponpoarding;
