import CommunityHeader from "@/src/components/Community/CommunityHeader";
import PostCard from "@/src/components/Community/PostCard";
import SearchBar from "@/src/components/Community/SearchBar";
import TopicsCommunity from "@/src/components/Community/TopicsCommunity";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const DATA = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Healthy Recipes",
    time: "2h ago",
    text: "Just tried this amazing quinoa bowl recipe! Perfect for meal prep 😋",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    likes: 42,
    comments: 8,
  },
  {
    id: "2",
    name: "Mike Chen",
    role: "Meal prep",
    time: "5h ago",
    text: "My weekly meal prep for 2400 calories. This is my 4th week and I'm loving the results! 💪",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    likes: 68,
    comments: 15,
  },
];

export default function Community() {
  const [active, setActive] = useState("feed");
  console.log(active);
  return (
    <View className="flex-1 bg-[#FFFFFF] ">
      <CommunityHeader />

      <SearchBar />

      <View className="flex-row px-[5%]  justify-between mb-4">
        <TouchableOpacity
          onPress={() => setActive("feed")}
          className={`  w-[45%] py-2 rounded-xl items-center justify-center ${active === "feed" ? "bg-[#89957F]" : "bg-gray-200"}`}
        >
          <Text
            className={`font-medium ${
              active === "feed" ? "text-[#FFFFFF]" : "text-gray-600"
            }`}
          >
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActive("topics")}
          className={` w-[45%] py-2 rounded-xl items-center justify-center ${active === "topics" ? "bg-[#89957F]" : "bg-gray-200"}`}
        >
          <Text
            className={`font-medium ${
              active === "topics" ? "text-[#FFFFFF]" : "text-gray-600"
            }`}
          >
            Topics
          </Text>
        </TouchableOpacity>
      </View>

      {active === "feed" ? (
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={(postId: string, isLiked: boolean) =>
                console.log("Post liked:", postId, isLiked)
              }
              onComment={(postId: string, comment: string) =>
                console.log("New comment:", comment)
              }
              onShare={(postId: string) => console.log("Share post:", postId)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      ) : (
        <TopicsCommunity />
      )}
    </View>
  );
}
