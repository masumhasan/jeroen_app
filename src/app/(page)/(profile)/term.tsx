import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { contentService } from "../../../services/contentService";
import { htmlToPlainText } from "../../../utils/contentFormatter";

const Term = () => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await contentService.getByType("terms-and-conditions");
        if (isMounted) {
          setContent(htmlToPlainText(response.content));
        }
      } catch {
        if (isMounted) {
          setError("Unable to load Terms & Conditions content right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] px-4">
      {/* Header */}
      <View className="flex-row items-center justify-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-[#222]">
          Terms & Condition
        </Text>
      </View>

      {/* Content Card */}
      <View className="bg-[#D9D9D9] rounded-[25px] p-5 flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#333" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-[14px] text-[#333] leading-6">
              {error || content}
            </Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Term;
