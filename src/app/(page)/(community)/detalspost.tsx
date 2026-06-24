import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams , router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { communityService } from "../../../services/communityService";
import { resolveRecipeImageUrl, resolveAvatarUrl } from "../../../utils/imageUrl";
import { AppImages } from "../../../../assets/appimage/appimages";
import { t, translateMealType } from "../../../i18n";

// Types
interface Comment {
  id: string;
  name: string;
  avatar?: string | null;
  content: string;
  timestamp: string;
}

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams();
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [updatingPost, setUpdatingPost] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Animations
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    const load = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const [data, SecureStore] = await Promise.all([
          communityService.getPostDetails(String(postId)),
          import("expo-secure-store"),
        ]);
        const raw = await SecureStore.getItemAsync("userData");
        if (raw) {
          const cached = JSON.parse(raw);
          setCurrentUserAvatar(resolveAvatarUrl(cached.avatar));
        }
        setPost(data.post);
        setEditContent(String(data.post?.content || ""));
        setIsLiked(Boolean(data.post?.likedByMe));
        setLikeCount(Number(data.post?.likeCount || 0));
        setComments(
          (data.comments || []).map((c: any) => ({
            id: c.id,
            name: c.user?.fullName || t("postDetails.defaultUser"),
            avatar: c.user?.avatar || null,
            content: c.content,
            timestamp: new Date(c.createdAt).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error("Failed to load post details:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const handleLike = () => {
    if (!post?.id) return;
    void communityService.toggleLike(post.id).then((data) => {
      setIsLiked(Boolean(data.likedByMe));
      setLikeCount(Number(data.likeCount || 0));
    });
  };

  const handleSavePostEdit = async () => {
    if (!post?.id) return;
    const content = editContent.trim();
    if (!content) {
      Alert.alert(t("postDetails.alerts.errorTitle"), t("postDetails.alerts.emptyContent"));
      return;
    }
    try {
      setUpdatingPost(true);
      const updated = await communityService.updatePost(post.id, content);
      setPost(updated);
      setEditContent(updated.content || content);
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert(
        t("postDetails.alerts.editFailedTitle"),
        error?.response?.data?.message || t("postDetails.alerts.editFailed")
      );
    } finally {
      setUpdatingPost(false);
    }
  };

  const handleDeletePost = () => {
    if (!post?.id) return;
    Alert.alert(t("postDetails.alerts.deleteTitle"), t("postDetails.alerts.deleteMessage"), [
      { text: t("postDetails.cancel"), style: "cancel" },
      {
        text: t("postDetails.alerts.deleteButton"),
        style: "destructive",
        onPress: async () => {
          try {
            await communityService.deletePost(post.id);
            router.back();
          } catch (error: any) {
            Alert.alert(
              t("postDetails.alerts.deleteFailedTitle"),
              error?.response?.data?.message || t("postDetails.alerts.deleteFailed")
            );
          }
        },
      },
    ]);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (!post?.id) return;
    void communityService.addComment(post.id, commentText.trim()).then((data) => {
      const newComment: Comment = {
        id: data.comment.id,
        name: data.comment?.user?.fullName || t("postDetails.you"),
        avatar: data.comment?.user?.avatar || null,
        content: data.comment.content,
        timestamp: new Date(data.comment.createdAt).toLocaleString(),
      };
      setComments([newComment, ...comments]);
      setCommentText("");
    });
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <Animated.View
      key={item.id}
      className="flex-row mb-5"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Image
        source={resolveAvatarUrl(item.avatar) ? { uri: resolveAvatarUrl(item.avatar)! } : AppImages.userAvatar}
        className="w-9 h-9 rounded-full"
      />

      <View className="ml-3 flex-1">
        <View className="bg-[#F8F9FA] p-3 rounded-2xl">
          <Text className="font-semibold text-[14px] text-[#1A1E2B]">
            {item.name}
          </Text>
          <Text className="text-[#4A5568] mt-1 leading-5">{item.content}</Text>
        </View>

        <View className="flex-row mt-2 items-center flex-wrap">
          <Text className="text-[#8A8A8A] text-[11px] font-medium mr-3">
            {item.timestamp}
          </Text>
          <TouchableOpacity activeOpacity={0.7} className="mr-3">
            <Text className="text-[#8A8A8A] text-[11px] font-medium">{t("postDetails.like")}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-[#8A8A8A] text-[11px] font-medium">{t("postDetails.reply")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#89957F" />
        </View>
      ) : (
      <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Animated Header */}
        <Animated.View
          className="flex-row items-center justify-between px-5 pt-2 pb-3 bg-white border-b border-[#F0F0F0]"
          style={{ opacity: headerOpacity }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center active:bg-[#E8E8E8]"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1A1E2B" />
          </TouchableOpacity>

          <Text className="text-[16px] font-semibold text-[#1A1E2B]">
            {t("postDetails.title")}
          </Text>

          {post?.isAuthor ? (
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setIsEditing((prev) => !prev)}
                className="px-2 py-1 rounded-md bg-[#F3F5F1]"
              >
                <Text className="text-[12px] text-[#6E7B62] font-semibold">
                  {isEditing ? t("postDetails.cancel") : t("postDetails.edit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeletePost}
                className="px-2 py-1 rounded-md bg-[#FFF1F1]"
              >
                <Text className="text-[12px] text-[#D05050] font-semibold">{t("postDetails.delete")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-10" />
          )}
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {/* Post Card */}
          <Animated.View
            className="bg-white px-5 pt-4 pb-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* User Info */}
            <View className="flex-row items-center">
              <Image
                source={resolveAvatarUrl(post?.user?.avatar) ? { uri: resolveAvatarUrl(post?.user?.avatar)! } : AppImages.userAvatar}
                className="w-12 h-12 rounded-full border-2 border-[#4A7C59]"
              />

              <View className="ml-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[16px] font-semibold text-[#1A1E2B]">
                    {post?.user?.fullName || t("postDetails.defaultUser")}
                  </Text>
                  {/* <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color="#8A8A8A"
                    />
                  </TouchableOpacity> */}
                </View>
                <View className="flex-row items-center mt-1">
                  <View className="bg-[#E8F3ED] px-2 py-1 rounded-full">
                    <Text className="text-[10px] font-medium text-[#4A7C59]">{post?.topic?.name || t("postDetails.defaultTopic")}</Text>
                  </View>
                  <Text className="text-[11px] text-[#8A8A8A] ml-2">{post?.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</Text>
                </View>
              </View>
            </View>

            {/* Post Text */}
            {isEditing ? (
              <View className="mt-4">
                <TextInput
                  value={editContent}
                  onChangeText={setEditContent}
                  multiline
                  className="bg-white border border-[#E2E2E2] rounded-2xl p-4 h-[120px] text-[14px]"
                />
                <TouchableOpacity
                  onPress={handleSavePostEdit}
                  disabled={updatingPost}
                  className={`mt-3 self-end px-4 py-2 rounded-lg ${
                    updatingPost ? "bg-[#A0A89B]" : "bg-[#7E8B73]"
                  }`}
                >
                  {updatingPost ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">{t("postDetails.save")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-[15px] text-[#4A5568] mt-4 leading-6">
                {post?.content}
              </Text>
            )}

            {/* Post Image — tappable for full-screen view */}
            {post?.image ? (
              <TouchableOpacity
                onPress={() => setImageViewerVisible(true)}
                activeOpacity={0.9}
                className="mt-4 rounded-2xl overflow-hidden"
              >
                <Image
                  source={{
                    uri: resolveRecipeImageUrl(post.image, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"),
                  }}
                  className="w-full"
                  style={{ height: post.postType === "meal_plan" ? 360 : 260 }}
                  resizeMode={post.postType === "meal_plan" ? "contain" : "cover"}
                />
              </TouchableOpacity>
            ) : null}

            {/* Structured meal plan details for meal_plan posts */}
            {post?.postType === "meal_plan" && post?.mealPlanData && (
              <View className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
                {(post.mealPlanData.meals || []).map((meal: any, idx: number) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between px-4 py-3 border-b border-gray-50"
                  >
                    <View className="flex-1">
                      <Text className="text-[10px] uppercase text-gray-400 font-semibold">{translateMealType(meal.mealType)}</Text>
                      <Text className="text-sm font-semibold text-gray-800 mt-0.5">{meal.name}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">
                        P: {meal.protein}g  C: {meal.carbs}g  F: {meal.fat}g
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-700">{meal.calories} <Text className="text-[10px] text-gray-400">kcal</Text></Text>
                  </View>
                ))}
                <View className="flex-row justify-between items-center px-4 py-3 bg-gray-50">
                  <Text className="text-xs font-bold text-gray-700">{t("shareMealPlan.total")}</Text>
                  <Text className="text-sm font-bold text-[#89957F]">{post.mealPlanData.totalCalories} kcal</Text>
                </View>
              </View>
            )}

            {/* Like / Comment Stats */}
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center space-x-6">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={22}
                    color={isLiked ? "#E94F64" : "#666"}
                  />
                  <Text className="ml-2 text-[#666] font-medium">
                    {likeCount}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center ml-2">
                  <Ionicons name="chatbubble-outline" size={21} color="#666" />
                  <Text className="ml-2 text-[#666] font-medium">
                    {comments.length}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Comments Section */}
          <Animated.View
            className="bg-white mt-2 px-5 pt-5 pb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-[18px] font-semibold text-[#1A1E2B]">
                {t("postDetails.commentsTitle")}
              </Text>
            </View>

            {comments.map((comment) => renderComment({ item: comment }))}

            {comments.length === 0 && (
              <View className="items-center py-8">
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#E0E0E0"
                />
                <Text className="text-[#8A8A8A] text-[14px] mt-3">
                  {t("postDetails.noComments")}
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.ScrollView>

        {/* Comment Input */}
        <Animated.View
          className="flex-row items-center px-4 py-3 bg-white border-t border-[#F0F0F0]"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Image
            source={currentUserAvatar ? { uri: currentUserAvatar } : AppImages.userAvatar}
            className="w-8 h-8 rounded-full mr-2"
          />

          <View className="flex-1 flex-row items-center bg-[#F5F7FA] rounded-full px-4 py-2">
            <TextInput
              placeholder={t("postDetails.writeComment")}
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              className="flex-1 text-[14px] text-[#1A1E2B] py-2"
              multiline
              maxLength={500}
            />

            {commentText.length > 0 && (
              <TouchableOpacity
                onPress={handleAddComment}
                className="ml-2 w-8 h-8 bg-[#89957F] rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
      </>
      )}

      {/* Full-screen image viewer */}
      {post?.image && (
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
                source={{ uri: resolveRecipeImageUrl(post.image, "") }}
                style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.85 }}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default PostDetailsScreen;
