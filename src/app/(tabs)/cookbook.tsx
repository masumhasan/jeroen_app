import { recipes } from "@/assets/data/recipes";
import Header from "@/src/components/cookbook/Header";
import LockedCard from "@/src/components/cookbook/LockedCard";
import RecipeCard from "@/src/components/cookbook/RecipeCard";
import TabSwitch from "@/src/components/cookbook/TabSwitch";
import { bookService } from "@/src/services/bookService";
import { authService } from "@/src/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface RejectionNotice {
  _id: string;
  bookTitle: string;
  adminNote: string;
}

export default function CookbookHome() {
  const [tab, setTab] = useState("library");
  const [refreshing, setRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [purchasedSkus, setPurchasedSkus] = useState<string[]>([]);
  const [rejectionNotices, setRejectionNotices] = useState<RejectionNotice[]>([]);

  const loadData = useCallback(async () => {
    const [user, requests] = await Promise.all([
      authService.getMe().catch(() => null),
      bookService.getMyAccessRequests().catch(() => []),
    ]);

    // Use live server value so admin revocations are reflected immediately
    const skus: string[] = user?.purchasedBooks ?? await bookService.getPurchasedSkus();

    // Keep SecureStore in sync with the fresh server value
    if (user?.purchasedBooks) {
      import("expo-secure-store").then(async (SecureStore) => {
        const raw = await SecureStore.getItemAsync("userData");
        if (raw) {
          const cached = JSON.parse(raw);
          await SecureStore.setItemAsync(
            "userData",
            JSON.stringify({ ...cached, purchasedBooks: user.purchasedBooks }),
          );
        }
      });
    }

    setPurchasedSkus(skus);

    // Show only rejected, undismissed requests that have an adminNote
    const notices = (requests as any[]).filter(
      (r) => r.status === "rejected" && r.adminNote && !r.dismissedAt,
    );
    setRejectionNotices(notices);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDismiss = useCallback(async (id: string) => {
    await bookService.dismissAccessRequest(id).catch(() => {});
    setRejectionNotices((prev) => prev.filter((n) => n._id !== id));
  }, []);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

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
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FFFFFF]">
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
        contentContainerStyle={{ paddingBottom: rejectionNotices.length > 0 ? 160 : 20, flexGrow: 1 }}
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

      {/* Rejection notices banner */}
      {rejectionNotices.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 gap-2">
          {rejectionNotices.map((notice) => (
            <View
              key={notice._id}
              className="bg-[#FFF8F0] border border-[#F5D89C] rounded-2xl p-4 flex-row items-start shadow-sm"
            >
              <Ionicons
                name="information-circle"
                size={20}
                color="#D97706"
                style={{ marginTop: 1, marginRight: 10 }}
              />
              <View className="flex-1">
                <Text className="text-[13px] font-bold text-[#92400E] mb-1">
                  Toegang geweigerd – {notice.bookTitle}
                </Text>
                <Text className="text-[12px] text-[#78350F] leading-5">
                  {notice.adminNote}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDismiss(notice._id)}
                className="ml-2 p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#92400E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
