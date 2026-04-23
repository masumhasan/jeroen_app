import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Award,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { recipeService } from "../../../services/recipeService";

const { width } = Dimensions.get("window");

const CookingMode = () => {
  const { recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<any>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe(recipeId as string);
    }
  }, [recipeId]);

  const fetchRecipe = async (id: string) => {
    setLoading(true);
    try {
      const data = await recipeService.getRecipe(id);
      setRecipe(data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7C866F" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const steps = recipe.recipeDetails.map((desc: string, i: number) => ({
    step: i + 1,
    title: `Step ${i + 1}`,
    time: "5 min", // Default time
    desc: desc
  }));

  const progressWidth = `${((index + 1) / steps.length) * 100}%`;

  return (
    <>
      <SafeAreaView className="flex-1 bg-[#FFFFFF]" edges={["top", "bottom"]}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={["#FFFFFF", "#FFFFFF"]}
          className="px-6 pt-4 pb-2"
        >
          {/* Top Navigation */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <X size={20} color="#4B5563" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cooking Progress
              </Text>
              <View className="flex-row items-center mt-1">
                <ChefHat size={16} color="#7C866F" />
                <Text className="text-sm font-semibold text-gray-700 ml-1">
                  Step {index + 1} of {steps.length}
                </Text>
              </View>
            </View>

            <View className="w-10 h-10 rounded-full bg-[#7C866F] items-center justify-center">
              <Award size={20} color="white" />
            </View>
          </View>

          {/* Progress Bar with Label */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-gray-500">
                Progress
              </Text>
              <Text className="text-xs font-semibold text-[#7C866F]">
                {Math.round(((index + 1) / (steps.length || 1)) * 100)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                style={{ width: progressWidth }}
                className="h-full bg-[#7C866F] rounded-full"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View className="flex-1">
          <Swiper
            ref={swiperRef}
            loop={false}
            showsPagination={false}
            onIndexChanged={(i) => setIndex(i)}
            scrollEnabled={true}
          >
            {steps.map((item: any, i: number) => (
              <View key={i} className="flex-1 justify-center items-center">
                <View className="items-center justify-center py-8 px-6">
                  <View className="w-12 h-12  flex-row justify-center items-center bg-[#8A957F] rounded-full ">
                    <Text className="text-2xl font-bold text-[#FFFFFF]">
                      {item.step}
                    </Text>
                  </View>

                  <Text className="text-3xl font-bold text-center text-gray-800 my-[4%]">
                    {item.title}
                  </Text>

                  <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full mb-[6%]">
                    <Clock size={16} color="#7C866F" />
                    <Text className="text-gray-600 font-medium ml-2">
                      {item.time}
                    </Text>
                  </View>

                  <View className=" p-5 rounded-2xl w-full mb-4">
                    <Text className="text-gray-700 text-base leading-6 text-center">
                      {item.desc}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Swiper>
        </View>

        <LinearGradient
          colors={["#FFFFFF", "#FFFFFF"]}
          className="px-6 py-4 border-t border-gray-100"
        >
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => swiperRef.current.scrollBy(-1)}
              activeOpacity={0.7}
              className={`flex-row items-center px-5 py-3 rounded-xl ${
                index === 0 ? "opacity-30" : "bg-gray-100"
              }`}
              style={{ minWidth: 100 }}
            >
              <ChevronLeft
                size={20}
                color={index === 0 ? "#9CA3AF" : "#4B5563"}
              />
              <Text
                className={`font-semibold ml-1 ${
                  index === 0 ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {/* Next / Complete Button */}
            {index === steps.length - 1 ? (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="flex-row items-center bg-[#7C866F] px-6 py-3 rounded-xl shadow-lg"
                style={{ elevation: 4 }}
              >
                <Text className="text-white font-semibold mr-2">Complete</Text>
                <Check size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => swiperRef.current.scrollBy(1)}
                activeOpacity={0.7}
                className="flex-row items-center bg-[#7C866F] px-6 py-3 rounded-xl shadow-lg"
                style={{ elevation: 4 }}
              >
                <Text className="text-white font-semibold mr-2">Next</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default CookingMode;
