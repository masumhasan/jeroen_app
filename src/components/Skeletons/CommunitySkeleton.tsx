import React from "react";
import { View, ScrollView } from "react-native";

interface SkeletonItemProps {
  className?: string;
}

const SkeletonItem = ({ className }: SkeletonItemProps) => {
  return <View className={`bg-gray-200 rounded-md ${className} animate-pulse`} />;
};

const PostSkeleton = () => {
  return (
    <View className="bg-white mx-4 mb-4 rounded-2xl border border-gray-200 overflow-hidden p-3">
      <View className="flex-row items-center mb-3">
        <SkeletonItem className="w-9 h-9 rounded-full mr-2" />
        <View>
          <SkeletonItem className="w-24 h-4 mb-1" />
          <SkeletonItem className="w-16 h-3" />
        </View>
      </View>
      <SkeletonItem className="w-full h-4 mb-2" />
      <SkeletonItem className="w-3/4 h-4 mb-3" />
      <SkeletonItem className="w-full h-48 rounded-xl mb-3" />
      <View className="flex-row items-center">
        <SkeletonItem className="w-12 h-6 rounded-full mr-6" />
        <SkeletonItem className="w-12 h-6 rounded-full" />
      </View>
    </View>
  );
};

const TopicSkeleton = () => {
  return (
    <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-3 mx-4">
      <View className="flex-row items-center">
        <SkeletonItem className="w-10 h-10 rounded-full mr-3" />
        <View>
          <SkeletonItem className="w-24 h-4 mb-1.5" />
          <SkeletonItem className="w-32 h-3" />
        </View>
      </View>
      <SkeletonItem className="w-20 h-8 rounded-full" />
    </View>
  );
};

interface CommunitySkeletonProps {
  type?: "feed" | "topics";
}

const CommunitySkeleton = ({ type = "feed" }: CommunitySkeletonProps) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      {type === "feed" ? (
        <View className="mt-2">
          <PostSkeleton />
          <PostSkeleton />
        </View>
      ) : (
        <View className="mt-2">
          <TopicSkeleton />
          <TopicSkeleton />
          <TopicSkeleton />
          <TopicSkeleton />
          <TopicSkeleton />
          <TopicSkeleton />
        </View>
      )}
    </ScrollView>
  );
};

export default CommunitySkeleton;
