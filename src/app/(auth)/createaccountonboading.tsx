import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const slides = [
  {
    icon: "target",
    title: "Personalized\nCalorie Tracking",
    desc: "Get precise daily calorie targets based on your unique body metrics and fitness goals.",
    button: "Next",
  },
  {
    icon: "sparkles",
    title: "Smart AI Meal\nGeneration",
    desc: "Our AI creates delicious, balanced meal plans that adapt to your preferences and dietary needs.",
    button: "Next",
  },
  {
    icon: "cart",
    title: "Auto Shopping\nLists",
    desc: "Never forget an ingredient. Get organized shopping lists generated from your weekly meal plan.",
    button: "Get Started",
  },
];

const CreateAccountOnboarding = () => {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      // Handle get started action
      router.replace("/signup");
      console.log("Onboarding completed");
      // Navigate to next screen
    }
  };

  const handleSkip = () => {
    router.replace("/signup");
    console.log("Onboarding skipped");
    // Navigate to next screen
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      {/* Progress Indicators */}
      <View className="flex-row justify-center mt-4 mb-2">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-[6px] mx-1 rounded-full ${
              currentIndex === index ? "w-8 bg-[#7D8B6A]" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={false}
        onIndexChanged={(index) => setCurrentIndex(index)}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={index} className="flex-1">
            <View className="flex-1 items-center justify-center px-8">
              {/* Icon Circle */}
              <View className="w-32 h-32 rounded-full bg-[#E5E5E5] items-center justify-center mb-10">
                {slide.icon === "target" && (
                  <Feather name="target" size={36} color="#7D8B6A" />
                )}
                {slide.icon === "sparkles" && (
                  <Ionicons name="sparkles-outline" size={36} color="#7D8B6A" />
                )}
                {slide.icon === "cart" && (
                  <Feather name="shopping-cart" size={36} color="#7D8B6A" />
                )}
              </View>

              {/* Title */}
              <Text className="text-[24px] font-semibold text-center text-[#222] mb-4">
                {slide.title}
              </Text>

              {/* Description */}
              <Text className="text-center text-gray-500 text-[14px] leading-5 mb-14">
                {slide.desc}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Bottom Actions */}
      <View className="px-8 pb-8">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#7D8B6A] w-full py-4 rounded-full flex-row justify-center items-center"
          activeOpacity={0.7}
        >
          <Text className="text-white text-[16px] font-semibold mr-2">
            {slides[currentIndex].button}
          </Text>
          <Feather name="chevron-right" size={18} color="white" />
        </TouchableOpacity>

        {/* Skip Button - Only show on first two slides */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} className="mt-6">
            <Text className="text-gray-500 text-[14px] text-center">Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CreateAccountOnboarding;
