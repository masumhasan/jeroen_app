import { router } from "expo-router";
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { AppImages } from "../../../assets/appimage/appimages";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { communityService } from "@/src/services/communityService";
import { t, translateMealType, translateDayName } from "../../i18n";

const commentTimestamp = (dateValue: string | Date | undefined) => {
  if (!dateValue) return "";
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return "";
  }
};

type FeedComment = {
  id: string;
  text: string;
  user: string;
  timestamp: string;
};

function CommentsModal({
  visible,
  onClose,
  comments,
  commentsLoading,
  commentText,
  onChangeCommentText,
  onSubmitComment,
}: {
  visible: boolean;
  onClose: () => void;
  comments: FeedComment[];
  commentsLoading: boolean;
  commentText: string;
  onChangeCommentText: (text: string) => void;
  onSubmitComment: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">{t("postCard.commentsTitle")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500">{t("postCard.close")}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className="flex-row mb-5">
                <Image
                  source={item.userAvatar ? { uri: item.userAvatar } : AppImages.userAvatar}
                  className="w-9 h-9 rounded-full"
                />
                <View className="ml-3 flex-1">
                  <View className="bg-[#F8F9FA] p-3 rounded-2xl">
                    <Text className="font-semibold text-[14px] text-[#1A1E2B]">{item.user}</Text>
                    <Text className="text-[#4A5568] mt-1 text-[14px] leading-5">{item.text}</Text>
                  </View>
                  <Text className="text-[#8A8A8A] text-[11px] font-medium mt-2">{item.timestamp}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              commentsLoading ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator color="#8A957F" />
                </View>
              ) : (
                <Text className="text-center text-gray-500 py-8">{t("postCard.noComments")}</Text>
              )
            }
          />
          <View className="p-4 border-t border-gray-200 flex-row">
            <TextInput
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2"
              placeholder={t("postCard.writeComment")}
              value={commentText}
              onChangeText={onChangeCommentText}
            />
            <TouchableOpacity onPress={onSubmitComment} className="bg-[#8A957F] px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">{t("postCard.post")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function MealPlanPostCard({
  post,
  onToggleLike,
  onAddComment,
}: {
  post: any;
  onToggleLike?: (postId: string) => Promise<{ likedByMe: boolean; likeCount: number } | void>;
  onAddComment?: (postId: string, content: string) => Promise<{ commentCount: number; comment?: any } | void>;
}) {
  const [isLiked, setIsLiked] = useState(Boolean(post.likedByMe));
  const [likesCount, setLikesCount] = useState(Number(post.likeCount || 0));
  const [commentsCount, setCommentsCount] = useState(Number(post.commentCount || 0));
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const mealPlanData = post.mealPlanData;

  useEffect(() => {
    if (!isCommentsVisible || !post.id) return;
    let cancelled = false;
    (async () => {
      setCommentsLoading(true);
      try {
        const data = await communityService.getPostDetails(String(post.id));
        if (cancelled) return;
        const mapped: FeedComment[] = (data.comments || []).map((c: any) => ({
          id: String(c.id),
          text: String(c.content ?? ""),
          user: c.user?.fullName || t("postCard.defaultUser"),
          timestamp: commentTimestamp(c.createdAt),
        }));
        setComments(mapped);
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isCommentsVisible, post.id]);

  const handleLike = async () => {
    if (!onToggleLike) return;
    try {
      const data = await onToggleLike(post.id);
      if (data) {
        setIsLiked(Boolean(data.likedByMe));
        setLikesCount(Number(data.likeCount || 0));
      }
    } catch { /* no-op */ }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert(t("postCard.alerts.errorTitle"), t("postCard.alerts.emptyComment"));
      return;
    }
    const text = commentText.trim();
    try {
      if (onAddComment) {
        const data = await onAddComment(post.id, text);
        if (data) setCommentsCount(Number(data.commentCount ?? commentsCount + 1));
        if (data?.comment) {
          const c = data.comment;
          setComments((prev) => [
            ...prev,
            { id: String(c.id), text: String(c.content ?? ""), user: c.user?.fullName || t("postCard.you"), timestamp: commentTimestamp(c.createdAt) },
          ]);
        }
      }
      setCommentText("");
    } catch {
      Alert.alert(t("postCard.alerts.errorTitle"), t("postCard.alerts.addFailed"));
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/detalspost", params: { postId: post.id } })}
        className="bg-white mx-4 mb-4 rounded-2xl border border-gray-200 overflow-hidden"
        activeOpacity={0.8}
      >
        {/* User info */}
        <View className="flex-row items-center p-3">
          <Image
            source={post.userAvatar ? { uri: post.userAvatar } : AppImages.userAvatar}
            className="w-9 h-9 rounded-full mr-2"
          />
          <View>
            <Text className="font-semibold text-sm">{post.name}</Text>
            <Text className="text-xs text-gray-500">{post.role} • {post.time}</Text>
          </View>
        </View>

        {/* Caption */}
        {post.text && post.text !== "Shared my daily meal plan" && (
          <Text className="px-3 pb-2 text-sm text-gray-700">{post.text}</Text>
        )}

        {/* Post image (generated meal plan preview) — tappable to view full */}
        {post.image && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={(e) => {
              e.stopPropagation();
              setImageViewerVisible(true);
            }}
          >
            <Image source={{ uri: post.image }} className="w-full" style={{ height: 280 }} resizeMode="contain" />
          </TouchableOpacity>
        )}

        {/* Expandable Meal Plan Details */}
        {mealPlanData && (
          <View>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              className="flex-row items-center justify-between px-3 py-2 bg-gray-50"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-[#89957F] mr-2" />
                <Text className="text-xs font-semibold text-gray-700">
                  {t("shareMealPlan.dayMealPlan", { day: translateDayName(mealPlanData.day) })}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-[#89957F] font-bold mr-1">
                  {mealPlanData.totalCalories} kcal
                </Text>
                {expanded ? (
                  <ChevronUp size={14} color="#6B7280" />
                ) : (
                  <ChevronDown size={14} color="#6B7280" />
                )}
              </View>
            </TouchableOpacity>

            {expanded && (
              <View className="border-t border-gray-100">
                {(mealPlanData.meals || []).map((meal: any, idx: number) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between px-3 py-2 border-b border-gray-50"
                  >
                    <View className="flex-1">
                      <Text className="text-[10px] uppercase text-gray-400 font-semibold">
                        {translateMealType(meal.mealType)}
                      </Text>
                      <Text className="text-xs font-medium text-gray-800">{meal.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-bold text-gray-700">{meal.calories} kcal</Text>
                      <Text className="text-[10px] text-gray-400">
                        P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                      </Text>
                    </View>
                  </View>
                ))}
                <View className="flex-row justify-between px-3 py-2 bg-gray-50">
                  <Text className="text-xs font-bold text-gray-600">{t("shareMealPlan.total")}</Text>
                  <Text className="text-xs text-gray-500">
                    P:{mealPlanData.totalProtein}g  C:{mealPlanData.totalCarbs}g  F:{mealPlanData.totalFat}g  •  {mealPlanData.totalCalories} kcal
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Like / Comment bar */}
        <View className="flex-row items-center p-3">
          <TouchableOpacity className="flex-row items-center mr-6" onPress={handleLike}>
            <Heart
              size={18}
              color={isLiked ? "#ef4444" : "#777"}
              fill={isLiked ? "#ef4444" : "transparent"}
            />
            <Text className="ml-1 text-gray-600 text-sm">{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center" onPress={() => setIsCommentsVisible(true)}>
            <MessageCircle size={18} color="#777" />
            <Text className="ml-1 text-gray-600 text-sm">{commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        comments={comments}
        commentsLoading={commentsLoading}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        onSubmitComment={handleAddComment}
      />

      {/* Full-screen image viewer */}
      {post.image && (
        <Modal visible={imageViewerVisible} transparent animationType="fade" onRequestClose={() => setImageViewerVisible(false)}>
          <View className="flex-1 bg-black/95 justify-center items-center">
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              className="absolute top-12 right-5 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Text className="text-white text-lg font-bold">✕</Text>
            </TouchableOpacity>
            <ScrollView
              className="flex-1 w-full"
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: post.image }}
                style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.85 }}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </>
  );
}
