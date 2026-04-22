import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Animated TouchableOpacity
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

const Chip = ({ label, selected = false, onPress }: ChipProps) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.7}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
      className={`px-4 py-2 mr-2 mb-2 rounded-full border ${
        selected ? "bg-[#89957F] border-[#89957F]" : "border-gray-200 bg-white"
      } shadow-sm`}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </AnimatedTouchable>
  );
};

const SectionHeader = ({
  title,
  optional = true,
}: {
  title: string;
  optional?: boolean;
}) => (
  <View className="flex-row items-center mb-2">
    <Text className="text-gray-700 font-semibold text-base">{title}</Text>
    {optional && (
      <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-2">
        <Text className="text-gray-500 text-xs">Optional</Text>
      </View>
    )}
  </View>
);

const DitaryProcess = () => {
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [targetWeight, setTargetWeight] = useState("65");
  const [searchQuery, setSearchQuery] = useState("");

  const dietary = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Paleo",
    "Low-Carb",
    "Mediterranean",
  ];

  const ingredients = [
    "Potatoes",
    "Onions",
    "Garlic",
    "Tomatoes",
    "Mushrooms",
    "Bell Peppers",
    "Eggplant",
    "Zucchini",
    "Broccoli",
    "Cauliflower",
    "Spinach",
    "Carrots",
    "Celery",
    "Corn",
    "Peas",
    "Green Beans",
  ];

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleIngredient = (item: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const clearAll = () => {
    setSelectedDietary([]);
    setSelectedIngredients([]);
    setAllergies("");
    setTargetWeight("65");
    setSearchQuery("");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-12 pb-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Dietary Preferences
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Customize your meal plan
              </Text>
            </View>
            <TouchableOpacity
              onPress={clearAll}
              className="bg-gray-100 px-4 py-2 rounded-full"
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 font-medium">Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Dietary Restrictions */}
        <View className="mt-6">
          <SectionHeader title="Dietary Restrictions" optional />
          <View className="flex-row flex-wrap mt-2">
            {dietary.map((item, index) => (
              <Chip
                key={index}
                label={item}
                selected={selectedDietary.includes(item)}
                onPress={() => toggleDietary(item)}
              />
            ))}
          </View>
        </View>

        {/* Unwanted Ingredients */}
        <View className="mt-6">
          <SectionHeader title="Unwanted Ingredients" optional />

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 mb-3 border border-gray-100">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search ingredients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-700"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#89957F" />
              </TouchableOpacity>
            )}
          </View>

          {/* Ingredients Grid */}
          <View className="flex-row flex-wrap mt-2">
            {filteredIngredients.map((item, index) => (
              <Chip
                key={index}
                label={item}
                selected={selectedIngredients.includes(item)}
                onPress={() => toggleIngredient(item)}
              />
            ))}
            {filteredIngredients.length === 0 && (
              <View className="py-8 w-full">
                <Text className="text-center text-gray-400">
                  No ingredients found
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Allergies */}
        <View className="mt-6">
          <SectionHeader title="Allergies" optional />
          <View className="bg-gray-50 rounded-xl border border-gray-100">
            <TextInput
              placeholder="e.g., Peanuts, Shellfish, Eggs"
              placeholderTextColor="#9CA3AF"
              value={allergies}
              onChangeText={setAllergies}
              className="px-4 py-3 text-gray-700"
              multiline
            />
          </View>
          <Text className="text-gray-400 text-xs mt-1 ml-1">
            Separate multiple allergies with commas
          </Text>
        </View>

        {/* Target Weight */}
        <View className="mt-6 mb-8">
          <SectionHeader title="Target Weight" optional={false} />
          <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-100">
            <TextInput
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="numeric"
              className="flex-1 px-4 py-3 text-gray-700"
              placeholder="Enter your target weight"
              placeholderTextColor="#9CA3AF"
            />
            <View className="px-4 py-3 bg-blue-50 rounded-r-xl">
              <Text className="text-[#89957F] font-semibold">kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DitaryProcess;
