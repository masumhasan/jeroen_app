import MotivationCard from "@/src/components/progress/MotivationCard";
import StatCard from "@/src/components/progress/StatCard";
import WeeklyConsistency from "@/src/components/progress/WeeklyConsistency";
import WeightJourneyCard from "@/src/components/progress/WeightJourneyCard";
import WeightTrendChart from "@/src/components/progress/WeightTrendChart";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Progress = () => {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      Extrapolate.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.98],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FA"]}
        className="absolute inset-0"
      />
      {/* Animated Header */}
      <Animated.View style={headerAnimatedStyle} className="px-4 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900 tracking-tight text-center">
          Progress Tracking
        </Text>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6d7a61"
            colors={["#6d7a61"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        className={"px-[5%]"}
      >
        {/* Stats Row with Staggered Animation */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="flex-row justify-between px-4 mb-4"
        >
          <StatCard
            title="3.5"
            subtitle="kg Lost"
            index={0}
            trend="down"
            value="3.5"
          />
          <StatCard
            title="8"
            subtitle="Weeks"
            index={1}
            trend="neutral"
            value="8"
          />
          <StatCard
            title="94%"
            subtitle="Consistency"
            index={2}
            trend="up"
            value="94"
          />
        </Animated.View>

        {/* Main Content Cards with Staggered Animation */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <WeightJourneyCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <WeightTrendChart />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <WeeklyConsistency />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <MotivationCard />
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
};

export default Progress;
