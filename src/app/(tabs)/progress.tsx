import MotivationCard from "@/src/components/progress/MotivationCard";
import StatCard from "@/src/components/progress/StatCard";
import WeeklyConsistency from "@/src/components/progress/WeeklyConsistency";
import WeightJourneyCard from "@/src/components/progress/WeightJourneyCard";
import WeightTrendChart from "@/src/components/progress/WeightTrendChart";
import { authService } from "@/src/services/authService";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MS_IN_WEEK = 7 * MS_IN_DAY;

const toOneDecimal = (n: number) => Number(n.toFixed(1));

const getWeekLabel = (date: Date) => {
  const d = date.getDate();
  const m = date.toLocaleString("en-US", { month: "short" });
  return `${m} ${d}`;
};

const Progress = () => {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    kgLost: 0,
    weeks: 1,
    consistencyPercent: 0,
    startWeight: 0,
    currentWeight: 0,
    targetWeight: 0,
    progressToGoal: 0,
    checkInsThisWeek: 0,
    checkInsWeeklyTarget: 7,
    trendLabels: ["Week 1"],
    trendValues: [0],
  });

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
    void loadProgressData().finally(() => setRefreshing(false));
  }, []);

  const loadProgressData = useCallback(async () => {
    try {
      const [user, mealPlanData] = await Promise.all([
        authService.getMe(),
        authService.getMealPlan().catch(() => null),
      ]);

      const historyRaw = Array.isArray(user?.weightHistory) ? user.weightHistory : [];
      const history = historyRaw
        .map((entry: any) => ({
          weight: Number(entry?.weight),
          recordedAt: entry?.recordedAt ? new Date(entry.recordedAt) : null,
        }))
        .filter((entry: any) => Number.isFinite(entry.weight))
        .sort((a: any, b: any) => {
          const ta = a.recordedAt ? a.recordedAt.getTime() : 0;
          const tb = b.recordedAt ? b.recordedAt.getTime() : 0;
          return ta - tb;
        });

      const firstHistoryWeight = history[0]?.weight;
      const startWeight = Number(
        user?.startWeight ?? firstHistoryWeight ?? user?.weight ?? 0
      );
      const currentWeight = Number(
        user?.currentWeight ?? user?.weight ?? startWeight
      );
      const targetWeight = Number(user?.targetWeight ?? currentWeight);

      const kgLost = Math.max(toOneDecimal(startWeight - currentWeight), 0);

      const now = Date.now();
      const firstDate = history[0]?.recordedAt
        ? history[0].recordedAt.getTime()
        : user?.createdAt
          ? new Date(user.createdAt).getTime()
          : now;
      const spanWeeks = Math.max(1, Math.ceil((now - firstDate) / MS_IN_WEEK));

      const weekAgo = now - MS_IN_WEEK;
      const checkInDays = new Set(
        history
          .filter((entry: any) => entry.recordedAt && entry.recordedAt.getTime() >= weekAgo)
          .map((entry: any) => entry.recordedAt.toISOString().slice(0, 10))
      );
      const checkInsThisWeek = checkInDays.size;
      const checkInsWeeklyTarget = 7;
      const consistencyPercent = Math.round(
        Math.min((checkInsThisWeek / checkInsWeeklyTarget) * 100, 100)
      );

      const weightGap = Math.max(startWeight - targetWeight, 0);
      const progressToGoal =
        weightGap <= 0
          ? currentWeight <= targetWeight
            ? 1
            : 0
          : Math.max(
              0,
              Math.min((startWeight - currentWeight) / weightGap, 1)
            );

      const historyForChart = history.length > 0
        ? history.slice(-8)
        : [{ weight: currentWeight, recordedAt: new Date() }];
      const trendValues = historyForChart.map((item: any) => toOneDecimal(item.weight));
      const trendLabels = historyForChart.map((item: any) =>
        item.recordedAt ? getWeekLabel(item.recordedAt) : "Now"
      );

      // Fallback consistency from current meal-plan size when no check-ins yet
      const mealsThisWeek = Array.isArray(mealPlanData?.plan)
        ? mealPlanData.plan.reduce(
            (sum: number, day: any) => sum + (Array.isArray(day?.meals) ? day.meals.length : 0),
            0
          )
        : 0;
      const effectiveConsistency = checkInsThisWeek > 0 ? consistencyPercent : Math.min(Math.round((mealsThisWeek / 21) * 100), 100);
      const effectiveCheckIns = checkInsThisWeek > 0 ? checkInsThisWeek : mealsThisWeek;
      const effectiveTarget = checkInsThisWeek > 0 ? checkInsWeeklyTarget : 21;

      setStats({
        kgLost,
        weeks: spanWeeks,
        consistencyPercent: effectiveConsistency,
        startWeight: toOneDecimal(startWeight),
        currentWeight: toOneDecimal(currentWeight),
        targetWeight: toOneDecimal(targetWeight),
        progressToGoal,
        checkInsThisWeek: effectiveCheckIns,
        checkInsWeeklyTarget: effectiveTarget,
        trendLabels,
        trendValues,
      });
    } catch (error) {
      console.error("Failed to load progress data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadProgressData();
    }, [loadProgressData])
  );

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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6d7a61" />
          <Text className="mt-3 text-gray-500">Loading your progress...</Text>
        </View>
      ) : (
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
            title={stats.kgLost.toString()}
            subtitle="kg Lost"
            index={0}
            trend="down"
            value={stats.kgLost.toString()}
          />
          <StatCard
            title={stats.weeks.toString()}
            subtitle="Weeks"
            index={1}
            trend="neutral"
            value={stats.weeks.toString()}
          />
          <StatCard
            title={`${stats.consistencyPercent}%`}
            subtitle="Consistency"
            index={2}
            trend="up"
            value={stats.consistencyPercent.toString()}
          />
        </Animated.View>

        {/* Main Content Cards with Staggered Animation */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <WeightJourneyCard
            startWeight={stats.startWeight}
            currentWeight={stats.currentWeight}
            targetWeight={stats.targetWeight}
            progress={stats.progressToGoal}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <WeightTrendChart
            labels={stats.trendLabels}
            values={stats.trendValues}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <WeeklyConsistency
            completed={stats.checkInsThisWeek}
            total={stats.checkInsWeeklyTarget}
            label={
              stats.checkInsWeeklyTarget === 21
                ? "Meals planned this week"
                : "Check-ins this week"
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <MotivationCard progressPercent={stats.progressToGoal * 100} />
        </Animated.View>
      </AnimatedScrollView>
      )}
    </View>
  );
};

export default Progress;
