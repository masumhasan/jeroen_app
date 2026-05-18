import { Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { t } from "../../i18n";

export default function Header() {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      className="px-5 pt-6 pb-3"
    >
      <Text className="text-3xl font-semibold text-gray-900 tracking-tight">
        {t("cookbookHeader.title")}
      </Text>
      <Text className="text-gray-500 text-sm mt-1">
        {t("cookbookHeader.subtitle")}
      </Text>
    </Animated.View>
  );
}
