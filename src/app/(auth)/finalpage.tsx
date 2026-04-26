import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { authService } from "../../services/authService";

const FinalPage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editableData, setEditableData] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70
  });
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const macroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const sliderWidthAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Individual macro animations
  const proteinAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authService.getMe();
        setUserData(user);
        setEditableData({
          calories: user.recommendedCalories || 2000,
          protein: user.recommendedProtein || 150,
          carbs: user.recommendedCarbs || 250,
          fat: user.recommendedFat || 70
        });
        startAnimations();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      await authService.updateProfile({
        recommendedCalories: editableData.calories,
        recommendedProtein: editableData.protein,
        recommendedCarbs: editableData.carbs,
        recommendedFat: editableData.fat
      });
      router.push("/community");
    } catch (error) {
      console.error("Error saving recommendations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPercentage = (value: number, total: number, multiplier: number) => {
    if (!total) return 0;
    return Math.round((value * multiplier / total) * 100);
  };

  const startAnimations = () => {
    // Initial fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // Stagger macro circle animations
    Animated.stagger(150, [
      Animated.spring(proteinAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(carbsAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(fatAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate macro scale
    Animated.spring(macroScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animate sliders
    Animated.timing(sliderWidthAnim, {
      toValue: 1,
      duration: 1000,
      delay: 600,
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();
  };

  // Button press animation
  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Macro circle animations
  const proteinScale = proteinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const carbsScale = carbsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const fatScale = fatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8A957F" />
      </View>
    );
  }

  return (
    <Animated.View
      className="flex-1 bg-[#F5F5F5] px-6 pt-16"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Top Icon with slide animation */}
      <Animated.View
        className="items-center mb-6"
        style={{
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Animated.View
          className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons name="sparkles-outline" size={30} color="#6B7280" />
        </Animated.View>

        <Animated.View
          className="flex-row items-center mt-3 bg-gray-200 px-4 py-1 rounded-full"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Ionicons name="flame-outline" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1 text-xs">
            {userData?.goal || "Maintenance"}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Title with fade animation */}
      <Animated.Text
        className="text-2xl font-bold text-center text-gray-800"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        Perfect, {userData?.firstName || "there"}! 🎉
      </Animated.Text>

      <Animated.Text
        className="text-center text-gray-500 mt-2 px-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        Your custom plan is ready based on your goal: {userData?.goal || "Maintenance"}
      </Animated.Text>

      {/* Calories with scale animation */}
      <Animated.View
        className="items-center mt-6"
        style={{
          transform: [{ scale: macroScaleAnim }],
        }}
      >
        <Text className="text-gray-400 text-sm">
          Recommended: {editableData.calories} calories
        </Text>

        <Animated.View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => {
            Alert.prompt("Update Calories", "Enter your target calories", (text) => {
              const val = parseInt(text);
              if (!isNaN(val)) setEditableData(prev => ({ ...prev, calories: val }));
            }, "plain-text", editableData.calories.toString());
          }} className="flex-row items-center">
            <Text className="text-4xl font-bold text-gray-700">
              {editableData.calories.toLocaleString()}
            </Text>
            <Ionicons
              name="pencil-outline"
              size={16}
              color="#6B7280"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </Animated.View>

        <Text className="text-gray-500 mt-1">Calories per day</Text>
      </Animated.View>

      {/* Macro Section Title */}
      <Animated.Text
        className="text-center text-gray-600 font-semibold mt-8"
        style={{
          opacity: fadeAnim,
        }}
      >
        Customize Macronutrient Breakdown
      </Animated.Text>

      {/* Macro Circles with staggered animations */}
      <View className="flex-row justify-between mt-6">
        {/* Protein */}
        <Animated.View
          className="items-center"
          style={{
            transform: [{ scale: proteinScale }],
          }}
        >
          <TouchableOpacity onPress={() => {
            Alert.prompt("Update Protein", "Enter protein in grams", (text) => {
              const val = parseInt(text);
              if (!isNaN(val)) setEditableData(prev => ({ ...prev, protein: val }));
            }, "plain-text", editableData.protein.toString());
          }}>
            <View className="w-20 h-20 rounded-full border-4 border-[#B8A99A] items-center justify-center">
              <Text className="font-bold">{editableData.protein}g</Text>
            </View>
          </TouchableOpacity>
          <Text className="mt-2 text-gray-700 font-medium">Protein</Text>
          <Text className="text-gray-400 text-xs">
            {getPercentage(editableData.protein, editableData.calories, 4)}%
          </Text>
        </Animated.View>

        {/* Carbs */}
        <Animated.View
          className="items-center"
          style={{
            transform: [{ scale: carbsScale }],
          }}
        >
          <TouchableOpacity onPress={() => {
            Alert.prompt("Update Carbs", "Enter carbs in grams", (text) => {
              const val = parseInt(text);
              if (!isNaN(val)) setEditableData(prev => ({ ...prev, carbs: val }));
            }, "plain-text", editableData.carbs.toString());
          }}>
            <View className="w-20 h-20 rounded-full border-4 border-[#D6C970] items-center justify-center">
              <Text className="font-bold">{editableData.carbs}g</Text>
            </View>
          </TouchableOpacity>
          <Text className="mt-2 text-gray-700 font-medium">Carbs</Text>
          <Text className="text-gray-400 text-xs">
            {getPercentage(editableData.carbs, editableData.calories, 4)}%
          </Text>
        </Animated.View>

        {/* Fat */}
        <Animated.View
          className="items-center"
          style={{
            transform: [{ scale: fatScale }],
          }}
        >
          <TouchableOpacity onPress={() => {
            Alert.prompt("Update Fat", "Enter fat in grams", (text) => {
              const val = parseInt(text);
              if (!isNaN(val)) setEditableData(prev => ({ ...prev, fat: val }));
            }, "plain-text", editableData.fat.toString());
          }}>
            <View className="w-20 h-20 rounded-full border-4 border-[#88937B] items-center justify-center">
              <Text className="font-bold">{editableData.fat}g</Text>
            </View>
          </TouchableOpacity>
          <Text className="mt-2 text-gray-700 font-medium">Fat</Text>
          <Text className="text-gray-400 text-xs">
            {getPercentage(editableData.fat, editableData.calories, 9)}%
          </Text>
        </Animated.View>
      </View>

      {/* Sliders with animated width */}
      <View className="mt-8">
        {/* Protein */}
        <Text className="text-gray-500 mb-2">Protein</Text>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <Animated.View
            className="h-2 bg-[#B8A99A] rounded-full"
            style={{ 
              width: sliderWidthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", `${getPercentage(editableData.protein, editableData.calories, 4)}%`]
              })
            }}
          />
        </View>

        {/* Carbs */}
        <Text className="text-gray-500 mt-4 mb-2">Carbs</Text>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <Animated.View
            className="h-2 bg-[#D6C970] rounded-full"
            style={{ 
              width: sliderWidthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", `${getPercentage(editableData.carbs, editableData.calories, 4)}%`]
              })
            }}
          />
        </View>

        {/* Fat */}
        <Text className="text-gray-500 mt-4 mb-2">Fat</Text>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <Animated.View
            className="h-2 bg-[#88937B] rounded-full"
            style={{ 
              width: sliderWidthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", `${getPercentage(editableData.fat, editableData.calories, 9)}%`]
              })
            }}
          />
        </View>
      </View>

      {/* Button with press animation */}
      <Animated.View
        style={{
          transform: [{ scale: buttonScaleAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleContinue}
          disabled={isSaving}
          className="mt-10 bg-[#8A957F] py-4 rounded-full items-center"
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Continue to Weekly Plan
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default FinalPage;
