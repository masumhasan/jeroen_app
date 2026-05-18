import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { recipeService } from "../../../services/recipeService";
import { t } from "../../../i18n";

const CATEGORIES = [
  "Ontbijt",
  "Lunch",
  "Diner",
  "Snack",
  "Dranken",
  "Uncategorised",
];

const MACRO_FIELDS = [
  { key: "kcal", label: "KCAL" },
  { key: "khd", label: "KHD" },
  { key: "vetten", label: "VETTEN" },
  { key: "eiwitten", label: "EIWITTEN" },
  { key: "vezels", label: "VEZELS" },
];

const AddRecipe = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[]>(["Ontbijt"]);
  const [personsServing, setPersonsServing] = useState("1");
  const [cookingTip, setCookingTip] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [macros, setMacros] = useState<Record<string, string>>({
    kcal: "0",
    khd: "0",
    vetten: "0",
    eiwitten: "0",
    vezels: "0",
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateMacro = (key: string, val: string) =>
    setMacros((prev) => ({ ...prev, [key]: val }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => setter((prev) => [...prev, ""]);

  const removeItem = (
    idx: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => setter((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (
    idx: number,
    val: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => setter((prev) => prev.map((v, i) => (i === idx ? val : v)));

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) {
        const updated = prev.filter((c) => c !== cat);
        return updated.length > 0 ? updated : prev;
      }
      return [...prev, cat];
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t("addRecipe.alerts.validationTitle"), t("addRecipe.alerts.nameRequired"));
      return;
    }
    const validIngredients = ingredients.filter((i) => i.trim().length > 0);
    if (validIngredients.length === 0) {
      Alert.alert(t("addRecipe.alerts.validationTitle"), t("addRecipe.alerts.ingredientRequired"));
      return;
    }

    setSaving(true);
    try {
      const data: any = {
        name: name.trim(),
        category: categories,
        personsServing: Number(personsServing) || 1,
        cookingTip: cookingTip.trim() || null,
        ingredients: validIngredients,
        recipeDetails: steps.filter((s) => s.trim().length > 0),
        nutrition: {
          kcal: macros.kcal ? Number(macros.kcal) : null,
          khd: macros.khd ? Number(macros.khd) : null,
          vetten: macros.vetten ? Number(macros.vetten) : null,
          eiwitten: macros.eiwitten ? Number(macros.eiwitten) : null,
          vezels: macros.vezels ? Number(macros.vezels) : null,
        },
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      if (imageUri) {
        const ext = imageUri.split(".").pop() || "jpg";
        formData.append("recipe_image", {
          uri: imageUri,
          name: `recipe.${ext}`,
          type: `image/${ext}`,
        } as any);
      }

      await recipeService.submitUserRecipe(formData);
      Alert.alert(t("addRecipe.alerts.successTitle"), t("addRecipe.alerts.submitted"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        t("addRecipe.alerts.errorTitle"),
        error?.response?.data?.message || t("addRecipe.alerts.nameRequired")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4"
          style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
            <Text className="text-[20px] font-black text-[#111]">
              {t("addRecipe.title")}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-5">
            {/* ─── RECIPE NAME ─── */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              {t("addRecipe.recipeNameLabel")}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t("addRecipe.recipeNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-[14px] font-medium text-[#111]"
              placeholderTextColor="#B0B0B0"
            />

            {/* ─── CATEGORY (multi-select chips) ─── */}
            <View className="mt-5">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                {t("addRecipe.category", { count: String(categories.length) })}
              </Text>
              <View className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ padding: 6, gap: 6 }}
                >
                  {CATEGORIES.map((cat) => {
                    const active = categories.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => toggleCategory(cat)}
                        className="px-3 py-2 rounded-lg flex-row items-center"
                        style={{
                          backgroundColor: active ? "#89957F" : "transparent",
                          gap: 4,
                        }}
                      >
                        {active && (
                          <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        )}
                        <Text
                          className="text-[12px] font-semibold"
                          style={{ color: active ? "#fff" : "#777" }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  {t("addRecipe.personsServing")}
                </Text>
                <TextInput
                  value={personsServing}
                  onChangeText={setPersonsServing}
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-[14px] font-medium text-[#111]"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
              <View className="flex-1" />
            </View>

            {/* ─── MACROS (5-column grid) ─── */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-2">
              {t("addRecipe.macros")}
            </Text>
            <View className="flex-row gap-2">
              {MACRO_FIELDS.map(({ key, label }) => (
                <View key={key} className="flex-1">
                  <Text className="text-[8px] font-bold text-gray-400 text-center mb-1">
                    {label}
                  </Text>
                  <TextInput
                    value={macros[key]}
                    onChangeText={(v) => updateMacro(key, v)}
                    keyboardType="numeric"
                    className="w-full px-1 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-center text-[12px] font-bold text-[#111]"
                    placeholderTextColor="#B0B0B0"
                    placeholder="0"
                  />
                </View>
              ))}
            </View>

            {/* ─── INGREDIENTS ─── */}
            <View className="flex-row items-center justify-between mt-6 mb-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t("addRecipe.ingredients")}
              </Text>
              <TouchableOpacity onPress={() => addItem(setIngredients)}>
                <Feather name="plus" size={18} color="#89957F" />
              </TouchableOpacity>
            </View>
            {ingredients.map((ing, idx) => (
              <View key={idx} className="flex-row items-center gap-2 mb-2">
                <TextInput
                  value={ing}
                  onChangeText={(v) => updateItem(idx, v, setIngredients)}
                  placeholder={t("addRecipe.ingredientPlaceholder", { n: String(idx + 1) })}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-[13px] text-[#111]"
                  placeholderTextColor="#B0B0B0"
                />
                <TouchableOpacity onPress={() => removeItem(idx, setIngredients)}>
                  <Feather name="minus" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* ─── RECIPE STEPS ─── */}
            <View className="flex-row items-center justify-between mt-5 mb-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t("addRecipe.recipeSteps")}
              </Text>
              <TouchableOpacity onPress={() => addItem(setSteps)}>
                <Feather name="plus" size={18} color="#89957F" />
              </TouchableOpacity>
            </View>
            {steps.map((step, idx) => (
              <View key={idx} className="flex-row items-start gap-2 mb-2">
                <TextInput
                  value={step}
                  onChangeText={(v) => updateItem(idx, v, setSteps)}
                  placeholder={t("addRecipe.stepPlaceholder", { n: String(idx + 1) })}
                  multiline
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-[13px] text-[#111] min-h-[56px]"
                  placeholderTextColor="#B0B0B0"
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={() => removeItem(idx, setSteps)}
                  className="mt-2"
                >
                  <Feather name="minus" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* ─── COOKING TIP ─── */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-1.5">
              {t("addRecipe.cookingTip")}
            </Text>
            <TextInput
              value={cookingTip}
              onChangeText={setCookingTip}
              placeholder={t("addRecipe.cookingTipPlaceholder")}
              multiline
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-[13px] text-[#111] min-h-[56px]"
              placeholderTextColor="#B0B0B0"
              textAlignVertical="top"
            />

            {/* ─── RECIPE IMAGE ─── */}
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-5 mb-1.5">
              {t("addRecipe.recipeImage")}
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              className="w-full h-[160px] rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center overflow-hidden"
              style={{ backgroundColor: "#F9F9F9" }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Feather name="upload" size={24} color="#B0B0B0" />
                  <Text className="text-[12px] text-gray-400 mt-2 font-medium">
                    {t("addRecipe.uploadImage")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ─── FOOTER ─── */}
          <View
            className="flex-row justify-end items-center gap-3 px-5 mt-6 pt-5"
            style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="px-6 py-3 rounded-xl"
            >
              <Text className="text-[14px] font-bold text-gray-500">
                {t("addRecipe.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              className="px-8 py-3 rounded-xl"
              style={{
                backgroundColor: "#89957F",
                opacity: saving ? 0.5 : 1,
                shadowColor: "#89957F",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-bold text-white">
                  {t("addRecipe.saveRecipe")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-center text-[11px] text-gray-400 mt-3 px-5">
            {t("addRecipe.reviewNote")}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddRecipe;
