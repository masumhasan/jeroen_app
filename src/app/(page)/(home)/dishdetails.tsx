import CircleGraph from "@/src/components/home/linkpage/dish/CercleGraph";
import DeatilsFull from "@/src/components/home/linkpage/dish/DeatilsFull";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { recipeService } from "../../../services/recipeService";

const DishDetails = () => {
  const { recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <ActivityIndicator size="large" color="#8F9B87" />
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

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      {/* Top Image */}
      <View className="relative">
        <Image
          source={{ uri: recipe.recipeImage }}
          className="w-full h-[320px]"
          resizeMode="cover"
        />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        {/* Heart Button */}
        <TouchableOpacity className="absolute top-14 right-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center">
          <Feather name="heart" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View className="bg-[#FFFFFF] px-6 pb-10 rounded-t-[25px] -mt-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Title */}
          <Text className="text-[26px] font-bold text-[#222] mt-4">
            {recipe.name}
          </Text>

          {/* Info */}
          <View className="flex-row mt-4 items-center gap-3 space-x-6">
            <View className="flex-row items-center">
              <Feather name="clock" size={16} color="#777" />
              <Text className="ml-2 text-[#777]">0 min</Text>
            </View>

            <View className="flex-row items-center">
              <Feather name="users" size={16} color="#777" />
              <Text className="ml-2 text-[#777]">{recipe.personsServing || 1} serving</Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/cookinfmode",
              params: { recipeId: recipe._id }
            })}
            className="mt-8 bg-[#8F9B87] py-4 rounded-full flex-row items-center justify-center"
          >
            <Feather name="play" size={18} color="white" />
            <Text className="text-white text-[16px] font-semibold ml-2">
              Start Cooking Mode
            </Text>
          </TouchableOpacity>

          <Text className="text-[20px] font-bold text-[#222] mt-4">
            Nutrition Breakdown
          </Text>

          {/* graph */}
          <CircleGraph nutrition={recipe.nutrition} />

          <DeatilsFull 
            ingredients={recipe.ingredients} 
            instructions={recipe.recipeDetails} 
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default DishDetails;
