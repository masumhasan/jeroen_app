import { recipes } from "@/assets/data/recipes";
import Header from "@/src/components/cookbook/Header";
import LockedCard from "@/src/components/cookbook/LockedCard";
import RecipeCard from "@/src/components/cookbook/RecipeCard";
import TabSwitch from "@/src/components/cookbook/TabSwitch";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
interface RecipeItem {
  id: string;
  locked: boolean;
  // other fields
}
export default function CookbookHome() {
  const [tab, setTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const filteredRecipes = useMemo(() => {
    if (tab === "all") return recipes;
    if (!hasClaimed) return [];
    return recipes.filter((recipe) => !recipe.locked);
  }, [tab, hasClaimed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: RecipeItem; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        exiting={FadeInUp}
        layout={Layout.springify()}
        style={{ flex: 1 }}
      >
        {item.locked ? <LockedCard item={item} /> : <RecipeCard item={item} />}
      </Animated.View>
    ),
    [],
  );

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <Animated.View entering={FadeInDown.duration(600)}>
        <Header />
        <TabSwitch tab={tab} setTab={setTab} />
      </Animated.View>

      <Animated.FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 20,
          gap: 16,
          marginBottom: 16,
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          tab === "library" ? (
            <View className="flex-1 items-center justify-center py-20 px-10">
              <TouchableOpacity
                className="bg-[#7C8B74] py-4 px-8 rounded-xl shadow-lg"
                onPress={() => setHasClaimed(true)}
              >
                <Text className="text-white text-center text-lg font-bold">
                  Claim Mijn Boeken
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#7C8B74" />
            </View>
          )
        }
      />
    </View>
  );
}
