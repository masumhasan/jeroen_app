import { router, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Clock, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { recipeService } from "../../../services/recipeService";

const { width: SCREEN_W } = Dimensions.get("window");
const SAGE = "#89957F";

type ParsedStep = {
  step: number;
  title: string;
  body: string;
  timeLabel: string;
};

const pickDuration = (raw: string): string => {
  const t = raw || "";
  const range = t.match(/(\d+)\s*[-–]\s*(\d+)\s*(min|minuten|sec|seconde)/i);
  if (range) {
    const unit = /min/i.test(range[3]) ? "min" : "sec";
    return `${range[1]}-${range[2]} ${unit}`;
  }
  const single = t.match(/(\d+)\s*(min|minuten|sec|seconde|uur)/i);
  if (single) {
    const u = single[2].toLowerCase();
    if (u.startsWith("min")) return `${single[1]} min`;
    if (u.startsWith("sec")) return `${single[1]} sec`;
    if (u.startsWith("uur")) return `${single[1]} h`;
  }
  return "~3 min";
};

const splitTitleAndBody = (
  raw: string,
  stepIndex: number
): { title: string; body: string } => {
  const t = (raw || "").trim();
  if (!t) {
    return { title: `Step ${stepIndex + 1}`, body: "" };
  }

  const m = t.match(
    /^([^.!?\n]+[.!?])([\s\S]*)$/
  );
  if (m && m[1] && m[1].length >= 6 && m[1].length <= 100) {
    const title = m[1].trim();
    const rest = (m[2] || "").trim();
    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      body: rest || t,
    };
  }

  const firstLine = t.split(/\r?\n/)[0].trim();
  if (firstLine.length > 0 && firstLine.length <= 56 && firstLine !== t) {
    return {
      title: firstLine.charAt(0).toUpperCase() + firstLine.slice(1),
      body: t.slice(firstLine.length).trim() || t,
    };
  }

  if (t.length > 64) {
    return {
      title: `Step ${stepIndex + 1}`,
      body: t,
    };
  }
  return {
    title: t.charAt(0).toUpperCase() + t.slice(1),
    body: t,
  };
};

const buildSteps = (details: string[] | undefined): ParsedStep[] => {
  const list = Array.isArray(details)
    ? details.map((d) => (typeof d === "string" ? d.trim() : "")).filter(Boolean)
    : [];
  if (list.length === 0) {
    return [
      {
        step: 1,
        title: "No instructions",
        body:
          "This recipe has no step-by-step instructions in the database yet. Add them in the recipe manager.",
        timeLabel: "—",
      },
    ];
  }
  return list.map((raw, i) => {
    const { title, body } = splitTitleAndBody(raw, i);
    return {
      step: i + 1,
      title: title || `Step ${i + 1}`,
      body: body || raw,
      timeLabel: pickDuration(raw),
    };
  });
};

const CookingMode = () => {
  const { recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<any>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe(recipeId as string);
    }
  }, [recipeId]);

  const fetchRecipe = async (id: string) => {
    setLoading(true);
    try {
      const data = await recipeService.getRecipe(id);
      setRecipe(data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const steps = useMemo(
    () => (recipe ? buildSteps(recipe.recipeDetails) : []),
    [recipe]
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={SAGE} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const total = steps.length;
  const progressWidth = total > 0 ? `${((index + 1) / total) * 100}%` : "0%";
  const pct = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="px-6 pt-2 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={20} color="#4B5563" />
          </TouchableOpacity>

          <View className="items-center flex-1 px-2">
            <Text
              className="text-sm font-semibold text-gray-800"
              numberOfLines={1}
            >
              Step {index + 1} of {total}
            </Text>
          </View>

          <View className="w-10" />
        </View>

        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View
            style={{ width: progressWidth, backgroundColor: SAGE }}
            className="h-full rounded-full"
          />
        </View>
        <View className="flex-row justify-end mt-1">
          <Text className="text-xs text-gray-500">{pct}%</Text>
        </View>
      </View>

      <View style={{ flex: 1, width: SCREEN_W }}>
        <Swiper
          ref={swiperRef}
          loop={false}
          showsPagination={false}
          onIndexChanged={(i) => setIndex(i)}
          width={SCREEN_W}
        >
          {steps.map((item, i) => {
            const showHeading =
              item.title &&
              item.body &&
              item.title.trim() !== item.body.trim();
            return (
              <View
                key={i}
                style={{ flex: 1, justifyContent: "center" }}
                className="px-6"
              >
                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-5"
                    style={{ backgroundColor: SAGE }}
                  >
                    <Text className="text-2xl font-bold text-white">
                      {item.step}
                    </Text>
                  </View>

                  {showHeading ? (
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-3 px-1">
                      {item.title}
                    </Text>
                  ) : null}

                  <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full mb-4">
                    <Clock size={16} color={SAGE} />
                    <Text className="text-gray-600 font-medium ml-2">
                      {item.timeLabel}
                    </Text>
                  </View>

                  <View className="w-full p-1">
                    <Text className="text-gray-700 text-base leading-6 text-center">
                      {item.body}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Swiper>
      </View>

      <View className="px-6 py-4 border-t border-gray-100 bg-white">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            disabled={index === 0}
            onPress={() => {
              if (index > 0 && (swiperRef.current as any)?.scrollBy) {
                (swiperRef.current as any).scrollBy(-1, true);
              }
            }}
            activeOpacity={0.7}
            className={`flex-row items-center px-4 py-3 rounded-xl ${
              index === 0 ? "opacity-30" : "border border-gray-200 bg-white"
            }`}
          >
            <ChevronLeft
              size={20}
              color={index === 0 ? "#9CA3AF" : "#374151"}
            />
            <Text
              className={`font-semibold ml-1 ${
                index === 0 ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {index === total - 1 ? (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="flex-row items-center px-6 py-3 rounded-xl"
              style={{ backgroundColor: SAGE, elevation: 3 }}
            >
              <Text className="text-white font-semibold mr-2">Complete</Text>
              <Check size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if ((swiperRef.current as any)?.scrollBy) {
                  (swiperRef.current as any).scrollBy(1, true);
                }
              }}
              activeOpacity={0.7}
              className="flex-row items-center px-6 py-3 rounded-xl"
              style={{ backgroundColor: SAGE, elevation: 3 }}
            >
              <Text className="text-white font-semibold mr-2">Next</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CookingMode;
