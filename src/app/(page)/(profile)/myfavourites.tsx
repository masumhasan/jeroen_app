import { resolveRecipeImageUrl } from "@/src/utils/imageUrl";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { recipeService } from "../../../services/recipeService";

const FALLBACK_IMAGE =
  "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";

export default function MyFavourites() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchFavourites();
    }, [])
  );

  const fetchFavourites = async () => {
    setLoading(true);
    try {
      const data = await recipeService.getFavourites();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching favourites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (recipeId: string) => {
    try {
      await recipeService.toggleFavourite(recipeId);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (error) {
      console.error("Error removing favourite:", error);
    }
  };

  const renderRecipe = ({ item }: { item: any }) => {
    const imageUri = resolveRecipeImageUrl(item.recipeImage, FALLBACK_IMAGE);
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(page)/(home)/dishdetails",
            params: { recipeId: item._id },
          })
        }
        className="flex-row items-center bg-[#F9F9F9] rounded-2xl p-3 mb-3 border border-[#F0F0F0]"
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUri }}
          className="w-[72px] h-[72px] rounded-xl"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-[15px] font-semibold text-[#222]" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1.5 gap-3">
            {item.nutrition?.kcal != null && (
              <Text className="text-[12px] text-[#8E8E93]">
                {Math.round(item.nutrition.kcal)} kcal
              </Text>
            )}
            {item.category && (
              <Text className="text-[12px] text-[#8E8E93]">
                {item.category}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveFavourite(item._id)}
          className="w-9 h-9 rounded-full items-center justify-center"
          activeOpacity={0.6}
        >
          <Ionicons name="heart" size={22} color="#E53E3E" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-5 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-[#111]">
            My Favourites
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#89957F" />
          </View>
        ) : recipes.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-16 h-16 rounded-full bg-[#FEF2F2] items-center justify-center mb-4">
              <Ionicons name="heart-outline" size={32} color="#E53E3E" />
            </View>
            <Text className="text-[17px] font-semibold text-[#222] text-center">
              No favourites yet
            </Text>
            <Text className="text-[14px] text-[#8E8E93] text-center mt-2">
              Tap the heart icon on any recipe to save it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item._id}
            renderItem={renderRecipe}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
