import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { t } from "../../i18n";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface Recipe {
  id: number;
  title: string;
  recipes: number;
  image: any;
  locked: boolean;
  price?: string;
  bookSku: string;
  buyUrl?: string;
}

type Props = {
  item: Recipe;
};

export default function RecipeCard({ item }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleOpen = () => {
    router.push({
      pathname: "/(page)/(cookbook)/bookrecipes",
      params: { bookSku: item.bookSku, bookTitle: item.title },
    });
  };

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable
        onPress={handleOpen}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={{ flex: 1 }}
      >
        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <View style={{ aspectRatio: 700 / 1080 }}>
            <Image
              source={typeof item.image === "string" ? { uri: item.image } : item.image}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          <View className="p-3">
            <View style={{ height: 40, justifyContent: "center" }}>
              <Text className="font-semibold text-gray-900 text-sm" numberOfLines={2}>
                {item.title}
              </Text>
            </View>

            <View className="bg-[#7C8B74] mt-3 py-2 px-3 rounded-full flex-row items-center justify-center">
              <Text className="text-white mr-1 font-medium text-xs">
                {t("recipeCard.inMyLibrary")}
              </Text>
              <Ionicons name="chevron-forward" size={12} color="white" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
