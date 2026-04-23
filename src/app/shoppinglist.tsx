import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

export default function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const data = await authService.getMealPlan();
      setShoppingList(data.shoppingList || []);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemName: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const totalItems = shoppingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(v => v).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7A8B6F" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold mr-8">
          Shopping List
        </Text>
      </View>

      {/* Progress */}
      <View className="px-6 mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500">{checkedCount} of {totalItems} items</Text>
          <Text className="text-gray-500">{Math.round(progress)}%</Text>
        </View>
        <View className="h-2 bg-gray-100 rounded-full">
          <View 
            className="h-2 bg-[#7A8B6F] rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {shoppingList.map((category, catIdx) => (
          <View key={catIdx} className="mb-6">
            <Text className="text-lg font-bold mb-4">
              {category.category} ({category.items.length})
            </Text>
            
            {category.items.map((item, itemIdx) => (
              <TouchableOpacity 
                key={itemIdx}
                onPress={() => toggleItem(item.name)}
                className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                  checkedItems[item.name] ? 'bg-[#7A8B6F] border-[#7A8B6F]' : 'border-gray-300'
                }`}>
                  {checkedItems[item.name] && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className={`flex-1 text-base ${
                  checkedItems[item.name] ? 'text-gray-400 line-through' : 'text-gray-800'
                }`}>
                  {item.name} ({item.amount})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {shoppingList.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="cart-outline" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4">Your shopping list is empty</Text>
            <Text className="text-gray-400">Generate a meal plan to see items here</Text>
          </View>
        )}
        
        <View className="h-20" />
      </ScrollView>

      {/* Export Button */}
      <View className="px-6 pb-6 absolute bottom-0 left-0 right-0 bg-white pt-2">
        <TouchableOpacity className="bg-[#7A8B6F] py-4 rounded-2xl flex-row items-center justify-center">
          <Ionicons name="download-outline" size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-lg ml-2">Export List</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
