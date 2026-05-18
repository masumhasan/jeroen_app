import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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

type Props = { item: Recipe };

export default function LockedCard({ item }: Props) {
  const scale = useSharedValue(1);
  const lockRotation = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98);
      lockRotation.value = withSequence(
        withTiming(-0.2, { duration: 100 }),
        withTiming(0.2, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${lockRotation.value}rad` }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[animatedStyle]} className="flex-1">
        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <View style={{ aspectRatio: 700 / 1080 }}>
            <Image 
              source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
              className="w-full h-full" 
              resizeMode="cover"
            />

            {/* Expo Blur Overlay */}
            <BlurView
              intensity={80}
              tint="extraLight"
              className="absolute inset-0"
            />

            <Animated.View
              style={lockStyle}
              className="absolute inset-0 items-center justify-center"
            >
              <View className="bg-[#FFFFFFE5] w-9 h-9 justify-center items-center rounded-full shadow-sm">
                <Ionicons name="lock-closed" size={20} color="#7C8B74" />
              </View>
            </Animated.View>
          </View>

          <View className="p-3">
            <Text className="font-semibold text-gray-900 text-sm" numberOfLines={2}>
              {item.title}
            </Text>

            {/* <Text className="text-gray-500 text-xs">
              {t("lockedCard.recipes", { count: String(item.recipes) })}
            </Text> */}

            <TouchableOpacity
              onPress={() => {}}
              className="bg-[#7C8B74] mt-3 py-2 rounded-full items-center"
              activeOpacity={1}
            >
              <Text className="text-white font-medium text-xs">{t("lockedCard.buy", { price: item.price ?? "" })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
