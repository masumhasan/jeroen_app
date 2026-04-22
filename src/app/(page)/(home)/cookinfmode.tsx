import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Award,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const steps = [
  {
    step: 1,
    title: "Prepare the Bread",
    time: "2 min",
    desc: "Toast 2 slices of whole grain bread until golden brown and crispy.",
  },
  {
    step: 2,
    title: "Poach the Eggs",
    time: "4 min",
    desc: "Bring a pot of water to a gentle simmer. Create a whirlpool and gently drop in the eggs.",
  },
  {
    step: 3,
    title: "Mash the Avocado",
    time: "2 min",
    desc: "Halve and pit the avocado. Scoop into a bowl and mash with salt, pepper and lemon juice.",
  },
  {
    step: 4,
    title: "Assemble",
    time: "1 min",
    desc: "Spread mashed avocado on toast. Place poached eggs on top and season.",
  },
  {
    step: 5,
    title: "Garnish & Serve",
    time: "1 min",
    desc: "Drizzle olive oil and garnish with fresh herbs. Serve immediately.",
  },
];

const CookingMode = () => {
  const swiperRef = useRef<any>(null);
  const [index, setIndex] = useState(0);

  const progressWidth = `${((index + 1) / steps.length) * 100}%`;
  const currentStep = steps[index];

  return (
    <>
      <SafeAreaView className="flex-1 bg-[#FFFFFF]" edges={["top", "bottom"]}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={["#FFFFFF", "#FFFFFF"]}
          className="px-6 pt-4 pb-2"
        >
          {/* Top Navigation */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <X size={20} color="#4B5563" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cooking Progress
              </Text>
              <View className="flex-row items-center mt-1">
                <ChefHat size={16} color="#7C866F" />
                <Text className="text-sm font-semibold text-gray-700 ml-1">
                  Step {index + 1} of {steps.length}
                </Text>
              </View>
            </View>

            <View className="w-10 h-10 rounded-full bg-[#7C866F] items-center justify-center">
              <Award size={20} color="white" />
            </View>
          </View>

          {/* Progress Bar with Label */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-gray-500">
                Progress
              </Text>
              <Text className="text-xs font-semibold text-[#7C866F]">
                {Math.round(((index + 1) / steps.length) * 100)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                style={{ width: progressWidth }}
                className="h-full bg-[#7C866F] rounded-full"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View className="flex-1">
          <Swiper
            ref={swiperRef}
            loop={false}
            showsPagination={false}
            onIndexChanged={(i) => setIndex(i)}
            scrollEnabled={true}
          >
            {steps.map((item, i) => (
              <View key={i} className="flex-1 justify-center items-center">
                <View className="items-center justify-center py-8 px-6">
                  <View className="w-12 h-12  flex-row justify-center items-center bg-[#8A957F] rounded-full ">
                    <Text className="text-2xl font-Inter text-[#FFFFFF] font-bold">
                      {item.step}
                    </Text>
                  </View>

                  <Text className="text-3xl font-bold text-center text-gray-800 my-[4%]">
                    {item.title}
                  </Text>

                  <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full mb-[6%]">
                    <Clock size={16} color="#7C866F" />
                    <Text className="text-gray-600 font-medium ml-2">
                      {item.time}
                    </Text>
                  </View>

                  <View className=" p-5 rounded-2xl w-full mb-4">
                    <Text className="text-gray-700 text-base leading-6 text-center">
                      {item.desc}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Swiper>
        </View>

        <LinearGradient
          colors={["#FFFFFF", "#FFFFFF"]}
          className="px-6 py-4 border-t border-gray-100"
        >
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => swiperRef.current.scrollBy(-1)}
              activeOpacity={0.7}
              className={`flex-row items-center px-5 py-3 rounded-xl ${
                index === 0 ? "opacity-30" : "bg-gray-100"
              }`}
              style={{ minWidth: 100 }}
            >
              <ChevronLeft
                size={20}
                color={index === 0 ? "#9CA3AF" : "#4B5563"}
              />
              <Text
                className={`font-semibold ml-1 ${
                  index === 0 ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {/* Next / Complete Button */}
            {index === steps.length - 1 ? (
              <TouchableOpacity
                onPress={() => router.replace("/dishdetails")}
                activeOpacity={0.7}
                className="flex-row items-center bg-[#7C866F] px-6 py-3 rounded-xl shadow-lg"
                style={{ elevation: 4 }}
              >
                <Text className="text-white font-semibold mr-2">Complete</Text>
                <Check size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => swiperRef.current.scrollBy(1)}
                activeOpacity={0.7}
                className="flex-row items-center bg-[#7C866F] px-6 py-3 rounded-xl shadow-lg"
                style={{ elevation: 4 }}
              >
                <Text className="text-white font-semibold mr-2">Next</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default CookingMode;
