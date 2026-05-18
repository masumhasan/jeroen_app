import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { authService } from "../../../services/authService";
import { t } from "../../../i18n";

const ShoppingList = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const data = await authService.getMealPlan();
        setCategories(data.shoppingList || []);
      } catch (error) {
        console.error("Error fetching shopping list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);

  const flatItems = useMemo(
    () =>
      categories.flatMap((category) =>
        (category.items || []).map((item: any) => ({
          key: `${category.category}::${item.name}`,
          label: `${item.name} (${item.amount})`,
          category: category.category,
        })),
      ),
    [categories],
  );

  const totalItems = flatItems.length;
  const selectedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage =
    totalItems > 0 ? Math.round((selectedCount / totalItems) * 100) : 0;

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const resetSelection = () => {
    setCheckedItems({});
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F7F7] items-center justify-center">
        <ActivityIndicator size="large" color="#89957F" />
        <Text className="mt-3 text-gray-500">{t("shoppingList.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F7F7F7] px-5 pt-14">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#0F0B18" />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-center flex-1">
          {t("shoppingList.title")}
        </Text>
        {selectedCount > 0 && (
          <TouchableOpacity
            onPress={resetSelection}
            className="bg-gray-200 px-3 py-1 rounded-full"
          >
            <Text className="text-gray-600 text-sm">{t("shoppingList.reset")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-[13px]">
            {t("shoppingList.itemsCount", { selected: String(selectedCount), total: String(totalItems) })}
          </Text>
          <Text className="text-[#89957F] text-[13px]">
            {progressPercentage}%
          </Text>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <View
            className="h-2 bg-[#89957F] rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {categories.map((category: any) => (
        <View key={category.category} className="mt-6">
          <Text className="text-[15px] font-semibold text-gray-800 mb-3">
            {category.category} ({(category.items || []).length})
          </Text>

          {(category.items || []).map((item: any, index: number) => {
            const itemKey = `${category.category}::${item.name}`;
            const selected = !!checkedItems[itemKey];
            return (
              <TouchableOpacity
                key={`${itemKey}-${index}`}
                onPress={() => toggleItem(itemKey)}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-4 mb-3 active:bg-gray-50"
              >
                <View
                  className={`w-5 h-5 rounded-full border mr-3 ${
                    selected ? "bg-[#89957F] border-[#89957F]" : "border-gray-400"
                  }`}
                >
                  {selected && (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-[14px] ${
                    selected ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
                >
                  {item.name} ({item.amount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {categories.length === 0 && (
        <View className="items-center py-10">
          <Text className="text-gray-500">{t("shoppingList.noList")}</Text>
          <Text className="text-gray-500">{t("shoppingList.generateHint")}</Text>
        </View>
      )}

      {/* Completion Message */}
      {selectedCount === totalItems && totalItems > 0 && (
        <View className="mt-6 p-4 bg-green-100 rounded-xl">
          <Text className="text-[#89957F] text-center font-semibold">
            {t("shoppingList.allDone")}
          </Text>
        </View>
      )}

      <TouchableOpacity className="bg-[#89957F] rounded-2xl flex-row justify-center items-center gap-[2%] py-3 mt-[6%]">
        <Feather name="download" size={20} color="#FFFFFF" />
        <Text className="text-[#FFFFFF] font-Inter font-bold text-xl">
          {t("shoppingList.exportList")}
        </Text>
      </TouchableOpacity>

      <View className="h-40" />
    </ScrollView>
  );
};

export default ShoppingList;
