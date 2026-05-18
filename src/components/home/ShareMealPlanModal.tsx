import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { communityService } from "@/src/services/communityService";
import { t, translateMealType, translateDayName } from "../../i18n";

interface MealItem {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

interface DayData {
  day: string;
  targetCalories: number;
  meals: MealItem[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  dayData: DayData;
  onShared?: () => void;
}

export default function ShareMealPlanModal({ visible, onClose, dayData, onShared }: Props) {
  const [caption, setCaption] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCaption("");
    setSelectedTopics([]);
    (async () => {
      try {
        setLoadingTopics(true);
        const data = await communityService.getTopics();
        setTopics(data || []);
        const mealPlanTopic = (data || []).find(
          (t: any) => t.name.toLowerCase().includes("meal plan")
        );
        if (mealPlanTopic) setSelectedTopics([mealPlanTopic.id]);
      } catch {
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    })();
  }, [visible]);

  const totalCalories = dayData.meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = dayData.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = dayData.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = dayData.meals.reduce((s, m) => s + m.fat, 0);

  const handleShare = async () => {
    if (selectedTopics.length === 0) {
      Alert.alert(t("shareMealPlan.alerts.topicRequired"), t("shareMealPlan.alerts.topicMessage"));
      return;
    }
    setIsSharing(true);
    try {
      await communityService.shareMealPlan({
        topicIds: selectedTopics,
        caption: caption.trim(),
        mealPlanData: {
          day: dayData.day,
          targetCalories: dayData.targetCalories,
          meals: dayData.meals,
        },
      });
      Alert.alert(t("shareMealPlan.alerts.sharedTitle"), t("shareMealPlan.alerts.sharedMessage"), [
        { text: t("shareMealPlan.alerts.ok"), onPress: () => { onClose(); onShared?.(); } },
      ]);
    } catch {
      Alert.alert(t("shareMealPlan.alerts.errorTitle"), t("shareMealPlan.alerts.shareFailed"));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-12 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">{t("shareMealPlan.title")}</Text>
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              className={`px-4 py-2 rounded-full ${isSharing ? "bg-gray-300" : "bg-[#89957F]"}`}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">{t("shareMealPlan.shareButton")}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Meal Plan Preview */}
            <View className="mt-4 rounded-2xl border border-gray-100 overflow-hidden">
              <View className="bg-[#89957F] px-4 py-3 flex-row justify-between items-center">
                <Text className="text-white font-bold">{t("shareMealPlan.dayMealPlan", { day: translateDayName(dayData.day) })}</Text>
                <Text className="text-white/80 text-xs">{t("shareMealPlan.target", { calories: String(dayData.targetCalories) })}</Text>
              </View>
              {dayData.meals.map((meal, idx) => (
                <View
                  key={idx}
                  className="px-4 py-3 flex-row justify-between items-center border-b border-gray-50"
                >
                  <View className="flex-1">
                    <Text className="text-[10px] uppercase text-gray-400 font-semibold">
                      {translateMealType(meal.mealType)}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800 mt-0.5">{meal.name}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      P: {meal.protein}g  C: {meal.carbs}g  F: {meal.fat}g
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-700">{meal.calories} kcal</Text>
                </View>
              ))}
              <View className="px-4 py-3 bg-gray-50 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs font-bold text-gray-700">{t("shareMealPlan.total")}</Text>
                  <Text className="text-[10px] text-gray-500">
                    P: {totalProtein}g  C: {totalCarbs}g  F: {totalFat}g
                  </Text>
                </View>
                <Text className="text-base font-bold text-[#89957F]">{totalCalories} kcal</Text>
              </View>
            </View>

            {/* Caption */}
            <Text className="text-sm font-semibold text-gray-700 mt-5 mb-2">{t("shareMealPlan.caption")}</Text>
            <TextInput
              placeholder={t("shareMealPlan.captionPlaceholder")}
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={500}
              textAlignVertical="top"
              className="border border-gray-200 rounded-xl p-3 h-24 text-sm text-gray-800"
            />
            <Text className="text-right text-xs text-gray-400 mt-1">{caption.length}/500</Text>

            {/* Topic Selector */}
            <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">{t("shareMealPlan.selectTopic")}</Text>
            {loadingTopics ? (
              <ActivityIndicator color="#89957F" className="py-4" />
            ) : (
              <View className="flex-row flex-wrap gap-2 mb-6">
                {topics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    onPress={() =>
                      setSelectedTopics((prev) =>
                        prev.includes(topic.id)
                          ? prev.filter((id) => id !== topic.id)
                          : [...prev, topic.id]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border ${
                      selectedTopics.includes(topic.id)
                        ? "bg-[#89957F] border-[#89957F]"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        selectedTopics.includes(topic.id) ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
