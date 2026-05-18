import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { t } from "../../../i18n";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { recipeService } from "../../../services/recipeService";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "#FFF8E1", text: "#F57F17", border: "#FFE082" },
  approved: { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  declined: { bg: "#FFEBEE", text: "#C62828", border: "#EF9A9A" },
};

const FALLBACK_IMAGE =
  "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";

const MyRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getMyUserRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyRecipes();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await recipeService.deleteUserRecipe(id);
            setRecipes((prev) => prev.filter((r) => r._id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete recipe.");
          }
        },
      },
    ]);
  };

  const resolveImage = (img?: string) => {
    if (!img) return FALLBACK_IMAGE;
    if (img.startsWith("http")) return img;
    return `http://10.0.2.2:5000${img}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-[#111]">{t("myRecipes.title")}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#89957F" />
        </View>
      ) : recipes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="book-open" size={48} color="#ccc" />
          <Text className="text-[16px] text-[#8E8E93] mt-4 text-center">
            {t("myRecipes.empty")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/addrecipe")}
            className="mt-6 bg-[#89957F] px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-semibold">{t("myRecipes.addFirst")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {recipes.map((recipe) => {
            const colors = statusColors[recipe.status] || statusColors.pending;
            return (
              <View
                key={recipe._id}
                className="flex-row bg-[#F5F5F5] rounded-2xl mb-3 overflow-hidden border border-gray-100"
              >
                <Image
                  source={{ uri: resolveImage(recipe.recipeImage) }}
                  className="w-[90px] h-[90px]"
                  resizeMode="cover"
                />
                <View className="flex-1 p-3 justify-between">
                  <View>
                    <Text className="text-[15px] font-semibold text-[#111]" numberOfLines={1}>
                      {recipe.name}
                    </Text>
                    <View className="flex-row items-center mt-1 gap-2">
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}
                      >
                        <Text className="text-[10px] font-bold capitalize" style={{ color: colors.text }}>
                          {recipe.status}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-[#8E8E93]">
                        {Array.isArray(recipe.category) ? recipe.category.join(", ") : recipe.category}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-end mt-1 gap-4">
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/(page)/(profile)/editrecipe", params: { recipeId: recipe._id } })}
                    >
                      <Feather name="edit-2" size={16} color="#89957F" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(recipe._id)}>
                      <Feather name="trash-2" size={16} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyRecipes;
