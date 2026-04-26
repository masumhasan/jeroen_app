import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface TopicItem {
  id: string;
  name: string;
  followerCount: number;
  following: boolean;
  color?: string;
}

interface TopicsCommunityProps {
  topics: TopicItem[];
  onToggleFollow: (topicId: string) => void;
}

const TopicsCommunity = ({ topics, onToggleFollow }: TopicsCommunityProps) => {
  const renderItem = ({ item }: { item: TopicItem }) => {
    return (
      <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-3">
        {/* Left Section */}
        <View className="flex-row items-center">
          {/* Circle Icon */}
          <View
            style={{ backgroundColor: item.color }}
            className="w-10 h-10 rounded-full mr-3"
          />

          {/* Text */}
          <View>
            <Text className="text-[15px] font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {(item.followerCount || 0).toLocaleString()} followers
            </Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggleFollow(item.id)}
          className={`px-4 py-2 rounded-full ${
            item.following ? "bg-[#8A957F]" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              item.following ? "text-white" : "text-gray-600"
            }`}
          >
            {item.following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FFFFFF] p-4">
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default TopicsCommunity;
