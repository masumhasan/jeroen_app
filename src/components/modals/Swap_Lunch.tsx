import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";
import { resolveRecipeImageUrl } from "../../utils/imageUrl";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SwapLunchProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  day: string;
  mealType: string;
  currentMeal: {
    recipeId: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image: string;
  };
  onSwapSuccess?: () => void;
}

interface AlternativeMeal {
  _id: string;
  name: string;
  recipeImage?: string;
  nutrition?: {
    kcal?: number;
    eiwitten?: number;
    khd?: number;
    vetten?: number;
  };
}

const FALLBACK_RECIPE_IMAGE =
  "https://raw.githubusercontent.com/masumhasan/jeroen_app/main/lunch.jpg";

const Swap_Lunch: React.FC<SwapLunchProps> = ({
  modalVisible,
  setModalVisible,
  day,
  mealType,
  currentMeal,
  onSwapSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<
    "calories" | "protein" | "name"
  >("calories");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "<400" | "400-550" | ">550"
  >("all");
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const fetchAlternatives = async () => {
    setLoading(true);
    try {
      const data = await authService.getSwapAlternatives({
        day,
        mealType,
        recipeId: currentMeal.recipeId,
        search: searchQuery.trim() || undefined,
        sort: selectedSort,
        calorieFilter: selectedFilter,
      });
      setAlternatives(data.alternatives || []);
      setSelectedMeal((prev) =>
        prev && (data.alternatives || []).some((item: any) => item._id === prev)
          ? prev
          : (data.alternatives?.[0]?._id ?? null),
      );
    } catch (error) {
      console.error("Failed to fetch swap alternatives:", error);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      resetPosition();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (!modalVisible) return;
    const timeout = setTimeout(() => {
      void fetchAlternatives();
    }, 250);
    return () => clearTimeout(timeout);
  }, [modalVisible, day, mealType, currentMeal.recipeId, searchQuery, selectedSort, selectedFilter]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSearchQuery("");
      setSelectedSort("calories");
      setSelectedFilter("all");
      setSelectedMeal(null);
    });
  };

  const resetPosition = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSwap = async () => {
    if (!selectedMeal) return;
    try {
      setSwapping(true);
      await authService.swapMeal({
        day,
        mealType,
        currentRecipeId: currentMeal.recipeId,
        newRecipeId: selectedMeal,
      });
      closeModal();
      onSwapSuccess?.();
      Alert.alert("Meal swapped", "Your meal plan has been updated.");
    } catch (error: any) {
      console.error("Failed to swap meal:", error);
      const message =
        error?.response?.data?.message || "Could not swap meal. Please try again.";
      Alert.alert("Swap failed", message);
    } finally {
      setSwapping(false);
    }
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={modalVisible}
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <Animated.View className="flex-1 bg-black/40" style={{ opacity: fadeAnim }}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModal} />

        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="h-[85%]"
          {...panResponder.panHandlers}
        >
          <View className="flex-1 bg-[#FFFFFF] rounded-t-3xl overflow-hidden">
            <View className="items-center pt-2 pb-1">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 px-5 bg-[#FFFFFF]"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <View className="flex-row justify-between items-center mb-4 pt-2">
                <View>
                  <Text className="text-xl font-semibold">Swap {mealType}</Text>
                  <Text className="text-gray-500 text-sm">Choose an alternative meal</Text>
                </View>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-500 mb-2">Current Meal</Text>
              <View className="bg-gray-100 rounded-xl p-3 flex-row items-center">
                <Image
                  source={{
                    uri: resolveRecipeImageUrl(currentMeal.image, FALLBACK_RECIPE_IMAGE),
                  }}
                  className="w-16 h-16 rounded-xl mr-3"
                />
                <View>
                  <Text className="font-semibold">{currentMeal.name}</Text>
                  <Text className="text-gray-500 text-sm">{currentMeal.calories} cal</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-white rounded-xl px-3 py-2 mt-4 border border-gray-200">
                <Ionicons name="search" size={18} color="gray" />
                <TextInput
                  placeholder="Search meals..."
                  className="ml-2 flex-1"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="gray" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View className="flex-row mt-4 gap-2">
                <SortButton
                  title="Calories"
                  active={selectedSort === "calories"}
                  onPress={() => setSelectedSort("calories")}
                />
                <SortButton
                  title="Protein"
                  active={selectedSort === "protein"}
                  onPress={() => setSelectedSort("protein")}
                />
                <SortButton
                  title="Name"
                  active={selectedSort === "name"}
                  onPress={() => setSelectedSort("name")}
                />
              </View>

              <View className="flex-row mt-4 gap-2">
                <Chip title="All" active={selectedFilter === "all"} onPress={() => setSelectedFilter("all")} />
                <Chip title="< 400 cal" active={selectedFilter === "<400"} onPress={() => setSelectedFilter("<400")} />
                <Chip title="400-550 cal" active={selectedFilter === "400-550"} onPress={() => setSelectedFilter("400-550")} />
                <Chip title="> 550 cal" active={selectedFilter === ">550"} onPress={() => setSelectedFilter(">550")} />
              </View>

              <Text className="text-gray-500 mt-4 mb-2">
                {alternatives.length} {alternatives.length === 1 ? "Alternative" : "Alternatives"} Found
              </Text>

              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator color="#89957F" />
                </View>
              ) : alternatives.length === 0 ? (
                <View className="py-8">
                  <Text className="text-gray-500">No alternatives found within +/-100 calories.</Text>
                </View>
              ) : (
                alternatives.map((meal) => (
                  <MealCard
                    key={meal._id}
                    name={meal.name}
                    cal={Number(meal?.nutrition?.kcal || 0)}
                    protein={Number(meal?.nutrition?.eiwitten || 0)}
                    carbs={Number(meal?.nutrition?.khd || 0)}
                    fat={Number(meal?.nutrition?.vetten || 0)}
                    image={resolveRecipeImageUrl(meal.recipeImage, FALLBACK_RECIPE_IMAGE)}
                    active={selectedMeal === meal._id}
                    onPress={() => setSelectedMeal(meal._id)}
                  />
                ))
              )}
            </ScrollView>

            <View className="px-5 py-4 border-t border-gray-100 bg-white">
              <TouchableOpacity
                className={`py-4 rounded-xl ${selectedMeal ? "bg-[#89957F]" : "bg-gray-300"}`}
                onPress={handleSwap}
                disabled={!selectedMeal || swapping}
              >
                {swapping ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">Swap</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Sort Button Component
const SortButton = ({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className={`flex-row items-center px-3 py-2 rounded-lg flex-1 justify-center ${
      active ? "bg-[#89957F]" : "bg-gray-200"
    }`}
    onPress={onPress}
  >
    <MaterialCommunityIcons
      name="tune"
      size={18}
      color={active ? "white" : "black"}
    />
    <Text className={`ml-1 text-sm ${active ? "text-white" : "text-black"}`}>
      Sort: {title}
    </Text>
  </TouchableOpacity>
);

// Chip Component
const Chip = ({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className={`px-4 py-2 rounded-full ${active ? "bg-[#89957F]" : "bg-gray-200"}`}
    onPress={onPress}
  >
    <Text className={`${active ? "text-white" : "text-black"} text-sm`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const MealCard = ({
  name,
  cal,
  protein,
  carbs,
  fat,
  image,
  active = false,
  onPress,
}: {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  active: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-3 rounded-xl my-3 ${
        active
          ? "border-2 border-[#89957F] bg-green-50"
          : "bg-white border border-gray-100"
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: image }} className="w-16 h-16 rounded-xl mr-3" />

      <View className="flex-1">
        <Text className="font-semibold text-base">{name}</Text>

        <View className="flex-row mt-2 flex-wrap gap-2">
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            {Math.round(cal)} cal
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            P: {Math.round(protein)}g
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            C: {Math.round(carbs)}g
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            F: {Math.round(fat)}g
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Swap_Lunch;
