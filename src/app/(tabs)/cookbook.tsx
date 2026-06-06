import { recipes } from "@/assets/data/recipes";
import Header from "@/src/components/cookbook/Header";
import LockedCard from "@/src/components/cookbook/LockedCard";
import RecipeCard from "@/src/components/cookbook/RecipeCard";
import TabSwitch from "@/src/components/cookbook/TabSwitch";
import { bookService } from "@/src/services/bookService";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

interface RecipeItem {
  id: number;
  title: string;
  recipes: number;
  image: any;
  locked: boolean;
  price?: string;
  bookSku: string;
  buyUrl?: string;
}

export default function CookbookHome() {
  const [tab, setTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [purchasedSkus, setPurchasedSkus] = useState<string[]>([]);

  // Load cached purchased SKUs on mount
  useEffect(() => {
    bookService.getPurchasedSkus().then(setPurchasedSkus);
  }, []);

  // Compute locked status dynamically based on what the user has purchased
  const booksWithLockStatus = useMemo<RecipeItem[]>(() => {
    return recipes.map((book) => ({
      ...book,
      locked: book.bookSku ? !purchasedSkus.includes(book.bookSku) : true,
    }));
  }, [purchasedSkus]);

  const filteredRecipes = useMemo(() => {
    if (tab === "all") return booksWithLockStatus;
    return booksWithLockStatus.filter((book) => !book.locked);
  }, [tab, booksWithLockStatus]);

  const handleClaimBooks = useCallback(async () => {
    setIsClaiming(true);
    try {
      const skus = await bookService.claimBooks();
      setPurchasedSkus(skus);
      if (skus.length === 0) {
        Alert.alert(
          "Geen boeken gevonden",
          "Er zijn geen aankopen gevonden voor jouw e-mailadres. Koop een boek op lisakookt.nl en probeer het opnieuw.",
        );
      }
    } catch {
      Alert.alert(
        "Fout",
        "Er is iets misgegaan bij het ophalen van je boeken. Probeer het later opnieuw.",
      );
    } finally {
      setIsClaiming(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    bookService.getPurchasedSkus().then((skus) => {
      setPurchasedSkus(skus);
      setRefreshing(false);
    });
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
              {isClaiming ? (
                <ActivityIndicator size="large" color="#7C8B74" />
              ) : (
                <>
                  <Text className="text-gray-500 text-center text-base mb-6">
                    Claim je gekochte boeken om ze hier te zien.
                  </Text>
                  <TouchableOpacity
                    className="bg-[#7C8B74] py-4 px-8 rounded-xl shadow-lg"
                    onPress={handleClaimBooks}
                  >
                    <Text className="text-white text-center text-lg font-bold">
                      Claim Mijn Boeken
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
