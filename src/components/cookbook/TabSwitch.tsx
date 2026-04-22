import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type Props = {
  tab: string;
  setTab: (value: string) => void;
};

export default function TabSwitch({ tab, setTab }: Props) {
  const allTabStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(tab === "all" ? "#7C8B74" : "#E5E7EB", {
      duration: 300,
    }),
  }));

  const libraryTabStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(tab === "library" ? "#7C8B74" : "#E5E7EB", {
      duration: 300,
    }),
  }));

  const allTextStyle = useAnimatedStyle(() => ({
    color: withTiming(tab === "all" ? "#FFFFFF" : "#374151", { duration: 300 }),
  }));

  const libraryTextStyle = useAnimatedStyle(() => ({
    color: withTiming(tab === "library" ? "#FFFFFF" : "#374151", {
      duration: 300,
    }),
  }));

  return (
    <View className="flex-row px-5 mb-4 gap-3">
      <Animated.View style={[{ flex: 1, borderRadius: 999 }, allTabStyle]}>
        <TouchableOpacity
          onPress={() => setTab("all")}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Animated.Text style={[allTextStyle, { fontWeight: "500" }]}>
            All Books
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[{ flex: 1, borderRadius: 999 }, libraryTabStyle]}>
        <TouchableOpacity
          onPress={() => setTab("library")}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Animated.Text style={[libraryTextStyle, { fontWeight: "500" }]}>
            My Library
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
