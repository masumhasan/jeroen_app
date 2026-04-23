import { AppImages } from "@/assets/appimage/appimages";
import DayTabs from "@/src/components/home/DayTabs";
import FooterActions from "@/src/components/home/FooterActions";
import MealCard from "@/src/components/home/MealCard";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { authService } from "../../services/authService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Home() {
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      let data = await authService.getMealPlan();
      if (!data.plan || data.plan.length === 0) {
        // Generate if not exists
        data = await authService.generateMealPlan();
      }
      setMealPlan(data.plan);
      setTargetCalories(data.targetCalories);
      
      // Set initial day to today if possible
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todayIdx = DAYS.indexOf(today);
      if (todayIdx !== -1) {
        setSelectedDayIndex(todayIdx);
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const data = await authService.generateMealPlan();
      setMealPlan(data.plan);
      setTargetCalories(data.targetCalories);
      Alert.alert("Success", "New meal plan generated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to regenerate meal plan");
    } finally {
      setRegenerating(false);
    }
  };

  const currentDayData = mealPlan.find(d => d.day === DAYS[selectedDayIndex]);
  const meals = currentDayData?.meals || [];

  const getFullImageUrl = (path: string) => {
    if (!path) return "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";
    if (path.startsWith('http')) return path;
    return `http://10.0.2.2:5000${path}`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7A8B6F" />
        <Text className="mt-4 text-gray-500">Loading your meal plan...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      {/* Title */}
      <View className="flex-row items-center justify-between px-[5%] py-4">
        <Image
          source={AppImages.logo}
          className="w-8 h-8  "
          resizeMode="contain"
        />
        <Text className="text-xl font-semibold text-center ">
          Weekly Meal Plan
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-[5%]">
        {/* Days */}
        <DayTabs 
          selectedDayIndex={selectedDayIndex} 
          onDayChange={setSelectedDayIndex} 
        />

        {/* Daily total */}
        <View className="bg-gray-100 rounded-xl p-4 flex-row justify-between mt-4">
          <Text className="text-gray-500">Daily Target</Text>
          <Text className="font-semibold text-gray-800">{targetCalories || 0} cal</Text>
        </View>

        {/* Meals */}
        {meals.map((meal: any, idx: number) => {
          if (!meal.recipe) return null;
          
          // Debug log for first meal
          if (idx === 0) console.log("Rendering Meal:", JSON.stringify(meal, null, 2));

          return (
            <TouchableOpacity 
              key={idx}
              onPress={() => router.push({
                pathname: "/dishdetails",
                params: { recipeId: meal.recipe._id }
              })}
            >
              <MealCard
                title={meal.recipe.name || "Unknown Recipe"}
                calories={meal.recipe.nutrition?.kcal?.toString() || "0"}
                protein={`${meal.recipe.nutrition?.eiwitten || 0}g`}
                carbs={`${meal.recipe.nutrition?.khd || 0}g`}
                fat={`${meal.recipe.nutrition?.vetten || 0}g`}
                type={(meal.mealType || meal.type || "Meal").toUpperCase()}
                image={getFullImageUrl(meal.recipe.recipeImage)}
              />
            </TouchableOpacity>
          );
        })}
        
        {meals.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">No meals found for this day.</Text>
          </View>
        )}

        <View className="h-20 w-full" />
      </ScrollView>

      <FooterActions 
        onRegenerate={handleRegenerate} 
        regenerating={regenerating}
      />
    </View>
  );
}
