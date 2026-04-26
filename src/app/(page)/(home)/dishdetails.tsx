import CircleGraph from "@/src/components/home/linkpage/dish/CercleGraph";
import DeatilsFull from "@/src/components/home/linkpage/dish/DeatilsFull";
import { resolveRecipeImageUrl } from "@/src/utils/imageUrl";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recipeService } from "../../../services/recipeService";

const FALLBACK_RECIPE_IMAGE =
  "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";

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

  const estimatedMinutes = useMemo(() => {
    if (!recipe) return 0;
    const n = Array.isArray(recipe.recipeDetails)
      ? recipe.recipeDetails.length
      : 0;
    if (n === 0) return 0;
    return Math.max(5, Math.round(n * 2.5));
  }, [recipe]);

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

  const imageUri = resolveRecipeImageUrl(
    recipe.recipeImage,
    FALLBACK_RECIPE_IMAGE
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]" edges={["top"]}>
      <View className="flex-1">
        {/* Top Image */}
        <View className="relative">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-[320px]"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity className="absolute top-4 right-5 bg-white/80 w-10 h-10 rounded-full items-center justify-center">
            <Feather name="heart" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View className="bg-[#FFFFFF] px-6 pb-10 rounded-t-[25px] -mt-6 flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <Text className="text-[26px] font-bold text-[#222] mt-4">
              {recipe.name}
            </Text>

            <View className="flex-row mt-4 items-center gap-3 space-x-6">
              <View className="flex-row items-center">
                <Feather name="clock" size={16} color="#777" />
                <Text className="ml-2 text-[#777]">
                  {estimatedMinutes > 0
                    ? `~${estimatedMinutes} min (est.)`
                    : "—"}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Feather name="users" size={16} color="#777" />
                <Text className="ml-2 text-[#777]">
                  {recipe.personsServing != null
                    ? `${recipe.personsServing} serving${
                        recipe.personsServing === 1 ? "" : "s"
                      }`
                    : "1 serving"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(page)/(home)/cookinfmode",
                  params: { recipeId: String(recipe._id) },
                })
              }
              className="mt-8 bg-[#89957F] py-4 rounded-full flex-row items-center justify-center"
            >
              <Feather name="play" size={18} color="white" />
              <Text className="text-white text-[16px] font-semibold ml-2">
                Start Cooking Mode
              </Text>
            </TouchableOpacity>

            <Text className="text-[20px] font-bold text-[#222] mt-6">
              Nutrition Breakdown
            </Text>

            <CircleGraph nutrition={recipe.nutrition} />

            {typeof recipe.cookingTip === "string" &&
            recipe.cookingTip.trim().length > 0 ? (
              <View className="mt-7 bg-[#F7F8F5] border border-[#E6E9E2] rounded-2xl p-4">
                <Text className="text-[18px] font-bold text-[#222] mb-2">
                  Cooking Tip
                </Text>
                <Text className="text-[14px] leading-6 text-[#5E6656]">
                  {recipe.cookingTip.trim()}
                </Text>
              </View>
            ) : null}

            <View className="mt-8">
            <DeatilsFull
              ingredients={recipe.ingredients}
              instructions={recipe.recipeDetails}
            />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DishDetails;
