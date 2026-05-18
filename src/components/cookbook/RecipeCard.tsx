import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export interface Recipe {
  id: number;
  title: string;
  recipes: number;
  image: any;
  locked: boolean;
  price?: string;
}

type Props = {
  item: Recipe;
};

export default function RecipeCard({ item }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98);
      opacity.value = withTiming(0.1);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[animatedStyle]} className="flex-1">
        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <Animated.View
            style={overlayStyle}
            className="absolute inset-0 bg-black z-10"
          />

          <View style={{ aspectRatio: 700 / 1080 }}>
            <Image
              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          <View className="p-3">
            <Text className="font-semibold text-gray-900 text-sm" numberOfLines={2}>
              {item.title}
            </Text>

            {/* <Text className="text-gray-500 text-xs">
              {t("recipeCard.recipes", { count: String(item.recipes) })}
            </Text> */}

            <TouchableOpacity
              onPress={() => {}}
              className="bg-[#7C8B74] mt-3 py-2 px-3 rounded-full flex-row items-center justify-center z-50"
              activeOpacity={1}
            >
              <Text className="text-white mr-1 font-medium text-xs">{t("recipeCard.viewRecipes")}</Text>
              <Ionicons name="chevron-forward" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
