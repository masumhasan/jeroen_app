import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getMyUserRecipes();
      setRecipes(data.recipes || []);
      setUnreadFeedbackCount(Number(data.unreadFeedbackCount || 0));
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

  const handleFeedbackNotifications = async () => {
    if (unreadFeedbackCount > 0) {
      try {
        setMarkingRead(true);
        await recipeService.markMyUserRecipeFeedbackRead();
        setRecipes((prev) =>
          prev.map((recipe) =>
            recipe.status === "declined" &&
            recipe.rejectionFeedback &&
            !recipe.rejectionFeedbackDismissedAt
              ? {
                  ...recipe,
                  rejectionFeedbackReadAt:
                    recipe.rejectionFeedbackReadAt ?? new Date().toISOString(),
                }
              : recipe
          )
        );
        setUnreadFeedbackCount(0);
      } catch (error) {
        console.error("Failed to mark recipe feedback as read:", error);
      } finally {
        setMarkingRead(false);
      }
    }

    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleDismissFeedback = async (id: string) => {
    try {
      await recipeService.dismissUserRecipeFeedback(id);
      
      const recipeToDismiss = recipes.find(r => r._id === id);
      if (recipeToDismiss && !recipeToDismiss.rejectionFeedbackReadAt) {
        setUnreadFeedbackCount(prev => Math.max(0, prev - 1));
      }

      setRecipes((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, rejectionFeedbackDismissedAt: new Date().toISOString() } : r
        )
      );
    } catch {
      Alert.alert("Error", "Failed to dismiss feedback.");
    }
  };

  const feedbackEntries = recipes.filter(
    (recipe) =>
      recipe.status === "declined" &&
      recipe.rejectionFeedback &&
      !recipe.rejectionFeedbackDismissedAt
  );

  const resolveImage = (img?: string) => {
    if (!img) return FALLBACK_IMAGE;
    if (img.startsWith("http")) return img;
    return `http://10.0.2.2:5000${img}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[18px] font-bold text-[#111]">
          {t("myRecipes.title")}
        </Text>
        <TouchableOpacity
          onPress={handleFeedbackNotifications}
          disabled={markingRead}
          className="relative w-10 h-10 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={t("myRecipes.feedbackNotifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#89957F" />
          {unreadFeedbackCount > 0 && (
            <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center bg-[#E53E3E]">
              <Text className="text-[10px] font-bold text-white">
                {unreadFeedbackCount > 9 ? "9+" : unreadFeedbackCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
          ref={scrollRef}
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
          {feedbackEntries.length > 0 && (
            <View className="mt-6 mb-4 rounded-3xl border border-red-100 bg-red-50/80 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="warning-outline" size={18} color="#C62828" />
                  <Text className="text-[15px] font-bold text-[#C62828]">
                    {t("myRecipes.feedbackTitle")}
                  </Text>
                </View>
                {unreadFeedbackCount > 0 && (
                  <View className="px-2.5 py-1 rounded-full bg-[#C62828]">
                    <Text className="text-[10px] font-bold text-white uppercase">
                      {t("myRecipes.newCount", { count: String(unreadFeedbackCount) })}
                    </Text>
                  </View>
                )}
              </View>

              <View className="gap-3">
                {feedbackEntries.map((recipe) => (
                  <View key={`${recipe._id}-feedback`} className="rounded-2xl bg-white p-4 border border-red-100">
                    <View className="flex-row items-start justify-between gap-3 mb-2">
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-[#111]" numberOfLines={1}>
                          {recipe.name}
                        </Text>
                        <Text className="text-[11px] text-[#8E8E93] mt-0.5">
                          {Array.isArray(recipe.category) ? recipe.category.join(", ") : recipe.category}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="px-2.5 py-1 rounded-full bg-[#FFF1F0] border border-[#F8C9C7]">
                          <Text className="text-[10px] font-bold text-[#C62828] uppercase">
                            {recipe.rejectionFeedbackReadAt ? t("myRecipes.feedbackRead") : t("myRecipes.feedbackUnread")}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => handleDismissFeedback(recipe._id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close-circle" size={20} color="#C62828" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text className="text-[13px] leading-5 text-[#444]">
                      {recipe.rejectionFeedback}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyRecipes;
