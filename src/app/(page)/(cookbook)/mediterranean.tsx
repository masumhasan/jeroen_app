import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const meals = [
  {
    id: 1,
    title: "Greek Quinoa Bowl",
    desc: "Fresh and healthy Mediterranean-inspired bowl",
    time: "25 min",
    serve: "2",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  },
  {
    id: 2,
    title: "Mediterran",
    desc: "Grilled salmon with herbs and lemon",
    time: "30 min",
    serve: "4",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
  },
  {
    id: 3,
    title: "Hummus",
    desc: "Quick and nutritious lunch option",
    time: "10 min",
    serve: "1",
    img: "https://images.unsplash.com/photo-1604908176997-4312e0b36b47",
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Mediterranean = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderMealItem = (item, index) => {
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemSlideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const imageScaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(itemSlideAnim, {
          toValue: 0,
          duration: 500,
          delay: index * 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: index * 150 + 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        key={item.id}
        style={{
          opacity: itemFadeAnim,
          transform: [{ translateY: itemSlideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View className="flex-row bg-[#EFEFEF] rounded-[18px] border border-[#BFBFBF] mb-4 overflow-hidden">
            {/* Image with scale animation */}
            <Animated.View
              style={{
                transform: [{ scale: imageScaleAnim }],
              }}
            >
              <Image
                source={{ uri: item.img }}
                className="w-[110px] h-[110px]"
                resizeMode="cover"
              />
            </Animated.View>

            {/* Content */}
            <View className="flex-1 p-3">
              <Text className="text-[16px] font-semibold text-[#222]">
                {item.title}
              </Text>

              <Text className="text-[13px] text-[#666] mt-1">{item.desc}</Text>

              {/* Info Row */}
              <View className="flex-row items-center mt-3">
                <Ionicons name="time-outline" size={14} color="#555" />
                <Text className="text-[12px] text-[#555] ml-1 mr-4">
                  {item.time}
                </Text>

                <Ionicons name="people-outline" size={14} color="#555" />
                <Text className="text-[12px] text-[#555] ml-1">
                  {item.serve}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Back button animation
  const backButtonRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(backButtonRotate, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const backButtonSpin = backButtonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  return (
    <View className="flex-1 bg-[#E9E9E9] pt-12 px-4">
      {/* Header with animation */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: headerScale }],
        }}
        className="flex-row items-center mb-6"
      >
        <AnimatedTouchable
          style={{
            transform: [{ rotate: backButtonSpin }],
          }}
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </AnimatedTouchable>

        <Text className="text-[22px] font-semibold text-[#222]">
          Mediterranean Delights
        </Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {meals.map((item, index) => renderMealItem(item, index))}
      </ScrollView>
    </View>
  );
};

export default Mediterranean;
