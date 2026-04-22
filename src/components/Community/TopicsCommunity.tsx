import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const DATA = [
  {
    id: "1",
    title: "Healthy Recipes",
    followers: "2,453 followers",
    following: true,
    color: "#7E8B77",
  },
  {
    id: "2",
    title: "Weekly Meal Plans",
    followers: "1,892 followers",
    following: true,
    color: "#D8CF8E",
  },
  {
    id: "3",
    title: "Fitness Nutrition",
    followers: "3,201 followers",
    following: false,
    color: "#9C8F82",
  },
  {
    id: "4",
    title: "Meal Prep Ideas",
    followers: "1,576 followers",
    following: false,
    color: "#D87C5A",
  },
];

const TopicsCommunity = () => {
  const renderItem = ({ item }) => {
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
              {item.title}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">{item.followers}</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          activeOpacity={0.8}
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
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default TopicsCommunity;
