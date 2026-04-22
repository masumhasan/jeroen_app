import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SwapLunchProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

interface Meal {
  id: string;
  name: string;
  cal: string;
  protein: string;
  carbs: string;
  fat: string;
  image: string;
  calories: number;
}

const Swap_Lunch: React.FC<SwapLunchProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<
    "calories" | "protein" | "name"
  >("calories");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedMeal, setSelectedMeal] = useState<string | null>("1");

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sample meal data
  const meals: Meal[] = [
    {
      id: "1",
      name: "Mediterranean Chickpea Salad",
      cal: "450",
      protein: "16g",
      carbs: "58g",
      fat: "21g",
      calories: 450,
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    },
    {
      id: "2",
      name: "Quinoa Buddha Bowl",
      cal: "450",
      protein: "16g",
      carbs: "58g",
      fat: "21g",
      calories: 450,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    },
    {
      id: "3",
      name: "Grilled Chicken Salad",
      cal: "380",
      protein: "32g",
      carbs: "12g",
      fat: "18g",
      calories: 380,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    },
    {
      id: "4",
      name: "Vegan Burrito Bowl",
      cal: "520",
      protein: "18g",
      carbs: "72g",
      fat: "16g",
      calories: 520,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    },
  ];

  // Pan responder for swipe to close
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
    });
  };

  const resetPosition = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Filter and sort meals
  const filteredMeals = meals
    .filter((meal) => {
      // Search filter
      if (
        searchQuery &&
        !meal.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Calorie filter
      if (selectedFilter === "<400" && meal.calories >= 400) return false;
      if (
        selectedFilter === "400-550" &&
        (meal.calories < 400 || meal.calories > 550)
      )
        return false;
      if (selectedFilter === ">550" && meal.calories <= 550) return false;

      return true;
    })
    .sort((a, b) => {
      if (selectedSort === "calories") {
        return a.calories - b.calories;
      } else if (selectedSort === "protein") {
        return parseInt(b.protein) - parseInt(a.protein);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const handleSelectMeal = (mealId: string) => {
    setSelectedMeal(mealId);
    // You can add haptic feedback here if desired
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={modalVisible}
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <Animated.View
        className="flex-1 bg-black/40"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={closeModal}
        />

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
          }}
          className="h-[85%]"
          {...panResponder.panHandlers}
        >
          <View className="flex-1 bg-[#FFFFFF] rounded-t-3xl overflow-hidden">
            {/* Drag indicator */}
            <View className="items-center pt-2 pb-1">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 px-5 bg-[#FFFFFF]"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4 pt-2">
                <View>
                  <Text className="text-xl font-semibold">Swap Lunch</Text>
                  <Text className="text-gray-500 text-sm">
                    Choose an alternative meal
                  </Text>
                </View>

                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Current Meal */}
              <Text className="text-gray-500 mb-2">Current Meal</Text>

              <View className="bg-gray-200 rounded-xl p-3 flex-row items-center">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                  }}
                  className="w-16 h-16 rounded-xl mr-3"
                />

                <View>
                  <Text className="font-semibold">Grilled Chicken Salad</Text>
                  <Text className="text-gray-500 text-sm">520 cal</Text>
                </View>
              </View>

              {/* Search */}
              <View className="flex-row items-center bg-white rounded-xl px-3 py-2 mt-4 border border-gray-200">
                <Ionicons name="search" size={18} color="gray" />
                <TextInput
                  placeholder="Search meals..."
                  className="ml-2 flex-1"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="gray" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Sort Buttons */}
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

              {/* Filter Chips */}
              <View className="flex-row mt-4 gap-2">
                <Chip
                  title="All"
                  active={selectedFilter === "all"}
                  onPress={() => setSelectedFilter("all")}
                />
                <Chip
                  title="< 400 cal"
                  active={selectedFilter === "<400"}
                  onPress={() => setSelectedFilter("<400")}
                />
                <Chip
                  title="400-550 cal"
                  active={selectedFilter === "400-550"}
                  onPress={() => setSelectedFilter("400-550")}
                />
                <Chip
                  title="> 550 cal"
                  active={selectedFilter === ">550"}
                  onPress={() => setSelectedFilter(">550")}
                />
              </View>

              {/* Results count */}
              <Text className="text-gray-500 mt-4 mb-2">
                {filteredMeals.length}{" "}
                {filteredMeals.length === 1 ? "Alternative" : "Alternatives"}{" "}
                Found
              </Text>

              {/* Meal Cards */}
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  {...meal}
                  active={selectedMeal === meal.id}
                  onPress={() => handleSelectMeal(meal.id)}
                />
              ))}

              {/* Confirm Button */}
              {/* {selectedMeal && (
                <TouchableOpacity
                  className="bg-[#89957F] py-4 rounded-xl mt-4 mb-6"
                  onPress={() => {
                    // Handle meal swap confirmation
                    closeModal();
                  }}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Confirm Swap
                  </Text>
                </TouchableOpacity>
              )} */}
              <View className="h-28" />
            </ScrollView>
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

// Meal Card Component
const MealCard = ({
  name,
  cal,
  protein,
  carbs,
  fat,
  image,
  active = false,
  onPress,
}: Meal & { active: boolean; onPress: () => void }) => {
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
            {cal} cal
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            P: {protein}
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            C: {carbs}
          </Text>
          <Text className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full">
            F: {fat}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Swap_Lunch;
