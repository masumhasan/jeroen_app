import CommunityHeader from "@/src/components/Community/CommunityHeader";
import MealPlanPostCard from "@/src/components/Community/MealPlanPostCard";
import PostCard from "@/src/components/Community/PostCard";
import SearchBar from "@/src/components/Community/SearchBar";
import TopicsCommunity from "@/src/components/Community/TopicsCommunity";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { communityService } from "../../services/communityService";
import { resolveRecipeImageUrl, resolveAvatarUrl } from "../../utils/imageUrl";
import { t } from "../../i18n";

const FALLBACK_POST_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd";

const formatRelativeTime = (dateValue: string) => {
  const date = new Date(dateValue);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("community.justNow");
  if (mins < 60) return `${mins}${t("community.minutesAgo")}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t("community.hoursAgo")}`;
  const days = Math.floor(hours / 24);
  return `${days}${t("community.daysAgo")}`;
};

export default function Community() {
  const [active, setActive] = useState("feed");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (active === "feed") {
        const feedPosts = await communityService.getFeed(search.trim());
        setPosts(feedPosts || []);
      } else {
        const topicItems = await communityService.getTopics(search.trim());
        setTopics(topicItems || []);
      }
    } catch (error) {
      console.error("Failed to load community data:", error);
    } finally {
      setLoading(false);
    }
  }, [active, search]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const mappedPosts = useMemo(
    () =>
      posts.map((item) => ({
        id: item.id,
        name: item.user?.fullName || t("community.unknownUser"),
        role: item.topic?.name || t("community.defaultTopic"),
        time: formatRelativeTime(item.createdAt),
        text: item.content,
        image: item.image ? resolveRecipeImageUrl(item.image, FALLBACK_POST_IMAGE) : null,
        userAvatar: resolveAvatarUrl(item.userAvatar || item.user?.avatar),
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        likedByMe: !!item.likedByMe,
        postType: item.postType || "text",
        mealPlanData: item.mealPlanData || null,
      })),
    [posts]
  );

  const handleToggleTopicFollow = async (topicId: string) => {
    try {
      const data = await communityService.toggleFollowTopic(topicId);
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                following: data.following,
                followerCount: data.followerCount,
              }
            : topic
        )
      );
      // If user changes follows and comes back to feed, refresh feed
      if (active === "feed") void loadData();
    } catch (error) {
      console.error("Failed to toggle topic follow:", error);
    }
  };

  const handleToggleLike = async (postId: string) => {
    return communityService.toggleLike(postId);
  };

  const handleAddComment = async (postId: string, content: string) => {
    return communityService.addComment(postId, content);
  };

  return (
    <View className="flex-1 bg-[#FFFFFF] ">
      <CommunityHeader />

      <SearchBar value={search} onChangeText={setSearch} />

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
            {t("community.feed")}
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
            {t("community.topics")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-10 items-center">
          <ActivityIndicator color="#89957F" />
        </View>
      ) : active === "feed" ? (
        <FlatList
          data={mappedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.postType === "meal_plan" ? (
              <MealPlanPostCard
                post={item}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
              />
            ) : (
              <PostCard
                post={item}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
              />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <View className="items-center py-10 px-6">
              <Text className="text-gray-500 text-center">
                {t("community.noPosts")}
              </Text>
            </View>
          }
        />
      ) : (
        <TopicsCommunity topics={topics} onToggleFollow={handleToggleTopicFollow} />
      )}
    </View>
  );
}
