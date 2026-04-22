import { Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Header() {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      className="px-5 pt-6 pb-3"
    >
      <Text className="text-3xl font-semibold text-gray-900 tracking-tight">
        Cookbook
      </Text>
      <Text className="text-gray-500 text-sm mt-1">
        Discover delicious recipes
      </Text>
    </Animated.View>
  );
}
