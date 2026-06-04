import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { t } from "../../i18n";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";
import {
  clampMacrosToCalories,
  macroCaloriesFromGrams,
} from "@/src/utils/nutritionTargets";

type EditableTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const FinalPage = () => {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiRecommended, setAiRecommended] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  });
  const [editableData, setEditableData] = useState<EditableTargets>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [calDraft, setCalDraft] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const macroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const proteinAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;

  const startAnimations = useCallback(() => {
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

    Animated.spring(macroScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [
    fadeAnim,
    scaleAnim,
    slideAnim,
    proteinAnim,
    carbsAnim,
    fatAnim,
    macroScaleAnim,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authService.getMe();
        setUserData(user);
        const baseCal = user.aiBaselineCalories ?? user.recommendedCalories ?? 2000;
        const baseP = user.aiBaselineProteinG ?? user.recommendedProtein ?? 150;
        const baseC = user.aiBaselineCarbsG ?? user.recommendedCarbs ?? 250;
        const baseF = user.aiBaselineFatG ?? user.recommendedFat ?? 70;
        setAiRecommended({
          calories: baseCal,
          protein: baseP,
          carbs: baseC,
          fat: baseF,
        });
        const cal = user.recommendedCalories ?? baseCal;
        const p = user.recommendedProtein ?? baseP;
        const c = user.recommendedCarbs ?? baseC;
        const f = user.recommendedFat ?? baseF;
        const clamped = clampMacrosToCalories(cal, p, c, f);
        setEditableData({
          calories: cal,
          protein: clamped.protein,
          carbs: clamped.carbs,
          fat: clamped.fat,
        });
        startAnimations();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startAnimations]);

  useEffect(() => {
    if (loading) return;
    setEditableData((prev) => {
      const clamped = clampMacrosToCalories(
        prev.calories,
        prev.protein,
        prev.carbs,
        prev.fat,
      );
      if (
        prev.protein === clamped.protein &&
        prev.carbs === clamped.carbs &&
        prev.fat === clamped.fat
      ) {
        return prev;
      }
      return { ...prev, ...clamped };
    });
  }, [editableData.calories, loading]);

  const openCalorieModal = () => {
    setCalDraft(String(editableData.calories));
    setCalModalOpen(true);
  };

  const applyCaloriesFromModal = () => {
    const parsed = parseInt(calDraft.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      Alert.alert(t("finalPage.errors.invalidValue"), t("finalPage.errors.calorieMin"));
      return;
    }
    const cap = Math.min(parsed, 50000);
    setEditableData((prev) => {
      const clamped = clampMacrosToCalories(cap, prev.protein, prev.carbs, prev.fat);
      return {
        calories: cap,
        protein: clamped.protein,
        carbs: clamped.carbs,
        fat: clamped.fat,
      };
    });
    setCalModalOpen(false);
  };

  const handleContinue = async () => {
    const finalCalories = macroCaloriesFromGrams(
      editableData.protein,
      editableData.carbs,
      editableData.fat,
    );
    if (finalCalories < 1) {
      Alert.alert(
        t("finalPage.errors.noMacrosTitle"),
        t("finalPage.errors.noMacrosMessage"),
      );
      return;
    }
    try {
      setIsSaving(true);
      await authService.updateProfile({
        recommendedCalories: finalCalories,
        recommendedProtein: editableData.protein,
        recommendedCarbs: editableData.carbs,
        recommendedFat: editableData.fat,
      });
      if (returnTo === "profile") {
        router.replace("/profile");
      } else {
        router.push("/community");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ||
        t("finalPage.errors.saveFailedMessage");
      Alert.alert(t("finalPage.errors.saveFailedTitle"), String(msg));
    } finally {
      setIsSaving(false);
    }
  };

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

  const coveredCalories = macroCaloriesFromGrams(
    editableData.protein,
    editableData.carbs,
    editableData.fat,
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8A957F" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-[#F5F5F5]"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
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

          <Animated.Text
            className="text-2xl font-bold text-center text-gray-800"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {t("finalPage.title", { firstName: userData?.firstName || "daar" })}
          </Animated.Text>

          <Animated.Text
            className="text-center text-gray-500 mt-2 px-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {t("finalPage.subtitle", { goal: userData?.goal || "Gewicht handhaven" })}
          </Animated.Text>

          <Animated.View
            className="items-center mt-6"
            style={{
              transform: [{ scale: macroScaleAnim }],
            }}
          >
            <Text className="text-gray-400 text-sm">
              {t("finalPage.recommended", { calories: aiRecommended.calories.toLocaleString("nl-NL") })}
            </Text>

            <Animated.View className="flex-row items-center mt-2">
              <Text className="text-4xl font-bold text-gray-700">
                {coveredCalories.toLocaleString("nl-NL")}
              </Text>
            </Animated.View>

            <Text className="text-gray-500 mt-1">{t("finalPage.caloriesPerDay")}</Text>
          </Animated.View>

          <View className="flex-row justify-between mt-8">
            <Animated.View
              className="items-center"
              style={{
                transform: [{ scale: proteinScale }],
              }}
            >
              <View className="w-20 h-20 rounded-full border-4 border-[#B8A99A] items-center justify-center">
                <Text className="font-bold">{editableData.protein}g</Text>
              </View>
              <Text className="mt-2 text-gray-700 font-medium">{t("finalPage.protein")}</Text>
            </Animated.View>

            <Animated.View
              className="items-center"
              style={{
                transform: [{ scale: carbsScale }],
              }}
            >
              <View className="w-20 h-20 rounded-full border-4 border-[#D6C970] items-center justify-center">
                <Text className="font-bold">{editableData.carbs}g</Text>
              </View>
              <Text className="mt-2 text-gray-700 font-medium">{t("finalPage.carbs")}</Text>
            </Animated.View>

            <Animated.View
              className="items-center"
              style={{
                transform: [{ scale: fatScale }],
              }}
            >
              <View className="w-20 h-20 rounded-full border-4 border-[#88937B] items-center justify-center">
                <Text className="font-bold">{editableData.fat}g</Text>
              </View>
              <Text className="mt-2 text-gray-700 font-medium">{t("finalPage.fat")}</Text>
            </Animated.View>
          </View>

          <Animated.Text
            className="text-center text-gray-600 font-semibold mt-6"
            style={{
              opacity: fadeAnim,
            }}
          >
            {t("finalPage.customizeMacros")}
          </Animated.Text>

          <View className="items-center mt-3">
            <View className="flex-row items-baseline">
              <TouchableOpacity
                onPress={openCalorieModal}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-2xl font-bold text-gray-400">
                  {editableData.calories.toLocaleString("nl-NL")}
                </Text>
                <Ionicons
                  name="pencil-outline"
                  size={12}
                  color="#9CA3AF"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-300 mx-1">/</Text>
              <Text
                className="text-2xl font-bold"
                style={{
                  color:
                    coveredCalories > editableData.calories
                      ? "#DC2626"
                      : "#8A957F",
                }}
              >
                {coveredCalories.toLocaleString("nl-NL")}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">
              {t("finalPage.budgetLabel")}
            </Text>
          </View>

          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-500">{t("finalPage.protein")}</Text>
              <Text className="text-gray-500 text-sm">{editableData.protein}g</Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={500}
              step={1}
              value={editableData.protein}
              minimumTrackTintColor="#B8A99A"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FFFFFF"
              onValueChange={(v) => {
                const next = Math.round(v);
                setEditableData((prev) => ({
                  ...prev,
                  protein: next,
                }));
              }}
            />

            <View className="flex-row justify-between items-center mt-2 mb-1">
              <Text className="text-gray-500">{t("finalPage.carbs")}</Text>
              <Text className="text-gray-500 text-sm">{editableData.carbs}g</Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={500}
              step={1}
              value={editableData.carbs}
              minimumTrackTintColor="#D6C970"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FFFFFF"
              onValueChange={(v) => {
                const next = Math.round(v);
                setEditableData((prev) => ({
                  ...prev,
                  carbs: next,
                }));
              }}
            />

            <View className="flex-row justify-between items-center mt-2 mb-1">
              <Text className="text-gray-500">{t("finalPage.fat")}</Text>
              <Text className="text-gray-500 text-sm">{editableData.fat}g</Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={200}
              step={1}
              value={editableData.fat}
              minimumTrackTintColor="#88937B"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FFFFFF"
              onValueChange={(v) => {
                const next = Math.round(v);
                setEditableData((prev) => ({
                  ...prev,
                  fat: next,
                }));
              }}
            />
          </View>

          <Text className="text-center text-xs text-gray-400 mt-4 px-2">
            {t("finalPage.macrosNote")}
          </Text>

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
              className="mt-8 bg-[#8A957F] py-4 rounded-full items-center"
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {returnTo === "profile" ? t("finalPage.saveTargets") : t("finalPage.continueButton")}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={calModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCalModalOpen(false)}
      >
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-lg font-bold text-gray-800 mb-2">{t("finalPage.dailyCalories")}</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-3 py-3 text-gray-900 text-lg"
              keyboardType="number-pad"
              value={calDraft}
              onChangeText={setCalDraft}
              placeholder={t("finalPage.caloriePlaceholder")}
              autoFocus
            />
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setCalModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
              >
                <Text className="text-gray-700 font-semibold">{t("finalPage.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyCaloriesFromModal}
                className="flex-1 py-3 rounded-xl bg-[#8A957F] items-center"
              >
                <Text className="text-white font-semibold">{t("finalPage.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default FinalPage;
