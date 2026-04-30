import { AppImages } from "@/assets/appimage/appimages";
import DayTabs from "@/src/components/home/DayTabs";
import FooterActions from "@/src/components/home/FooterActions";
import MealCard from "@/src/components/home/MealCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { authService } from "../../services/authService";
import { resolveRecipeImageUrl } from "@/src/utils/imageUrl";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildWeekDays(startDay: string) {
  const idx = ALL_DAYS.indexOf(startDay);
  const start = idx >= 0 ? idx : 0;
  return [...ALL_DAYS.slice(start), ...ALL_DAYS.slice(0, start)];
}

export default function Home() {
  const [currentWeekPlan, setCurrentWeekPlan] = useState<any[]>([]);
  const [nextWeekPlan, setNextWeekPlan] = useState<any[]>([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [weekStartDay, setWeekStartDay] = useState("Monday");
  const [mealPlanStartDate, setMealPlanStartDate] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [generatingNextWeek, setGeneratingNextWeek] = useState(false);

  const combinedPlan = useMemo(
    () => [...currentWeekPlan, ...nextWeekPlan],
    [currentWeekPlan, nextWeekPlan],
  );
  const totalDays = combinedPlan.length || 7;
  const isLastDay = selectedDayIndex === totalDays - 1;

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const applyPlanData = (data: any, selectToday = true) => {
    setCurrentWeekPlan(data.plan || []);
    setNextWeekPlan(data.nextWeekPlan || []);
    setTargetCalories(data.targetCalories);
    if (data.weekStartDay) setWeekStartDay(data.weekStartDay);
    if (data.mealPlanStartDate) setMealPlanStartDate(data.mealPlanStartDate);

    if (selectToday) {
      const days = buildWeekDays(data.weekStartDay || "Monday");
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todayIdx = days.indexOf(today);
      if (todayIdx !== -1) {
        setSelectedDayIndex(todayIdx);
      }
    }
  };

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      let data = await authService.getMealPlan();
      if (!data.plan || data.plan.length === 0) {
        data = await authService.generateMealPlan();
      }
      applyPlanData(data, true);
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
      applyPlanData(data, true);
      Alert.alert("Success", "New meal plan generated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to regenerate meal plan");
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateNextWeek = async () => {
    setGeneratingNextWeek(true);
    const firstNewDayIndex = totalDays;
    try {
      const data = await authService.generateNextWeekMealPlan();
      applyPlanData(data, false);
      setSelectedDayIndex(firstNewDayIndex);
      Alert.alert("Success", "Next week's meal plan is ready!");
    } catch (error) {
      Alert.alert("Error", "Failed to generate next week's meal plan");
    } finally {
      setGeneratingNextWeek(false);
    }
  };

  const currentDayData = combinedPlan[selectedDayIndex];
  const meals = currentDayData?.meals || [];

  const orderedDays = buildWeekDays(weekStartDay);
  const dayNameForSwap = currentDayData?.day || orderedDays[selectedDayIndex % 7];

  const fallbackImg =
    "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";

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
          weekStartDay={weekStartDay}
          mealPlanStartDate={mealPlanStartDate}
          totalDays={totalDays}
        />

        {/* Daily total */}
        <View className="bg-gray-100 rounded-xl p-4 flex-row justify-between mt-4">
          <Text className="text-gray-500">Daily Target</Text>
          <Text className="font-semibold text-gray-800">{targetCalories || 0} cal</Text>
        </View>

        {/* Meals */}
        {meals.map((meal: any, idx: number) => {
          if (!meal.recipe) return null;

          return (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                router.push({
                  pathname: "/(page)/(home)/dishdetails",
                  params: { recipeId: String(meal.recipe._id) },
                })
              }
            >
              <MealCard
                recipeId={String(meal.recipe._id)}
                title={meal.recipe.name || "Unknown Recipe"}
                calories={meal.recipe.nutrition?.kcal?.toString() || "0"}
                protein={`${meal.recipe.nutrition?.eiwitten || 0}g`}
                carbs={`${meal.recipe.nutrition?.khd || 0}g`}
                fat={`${meal.recipe.nutrition?.vetten || 0}g`}
                type={(meal.mealType || meal.type || "Meal").toUpperCase()}
                day={dayNameForSwap}
                image={resolveRecipeImageUrl(
                  meal.recipe.recipeImage,
                  fallbackImg
                )}
                onMealSwapped={fetchMealPlan}
              />
            </TouchableOpacity>
          );
        })}
        
        {meals.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400">No meals found for this day.</Text>
          </View>
        )}

        {/* Generate Next Week button — on the last day of the entire plan */}
        {isLastDay && (
          <TouchableOpacity
            onPress={handleGenerateNextWeek}
            disabled={generatingNextWeek}
            className="mt-6 mb-2 rounded-2xl border-2 border-[#7A8B6F] py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
            style={{ opacity: generatingNextWeek ? 0.6 : 1 }}
          >
            {generatingNextWeek ? (
              <ActivityIndicator color="#7A8B6F" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={20} color="#7A8B6F" />
                <Text className="text-[#7A8B6F] font-semibold text-base ml-2">
                  Generate Next Week's Meal Plan
                </Text>
              </>
            )}
          </TouchableOpacity>
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
