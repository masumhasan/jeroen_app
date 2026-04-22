import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Types
interface Comment {
  id: string;
  name: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

const PostDetailsScreen = () => {
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "Looks amazing! What containers are you using?",
      timestamp: "3h ago",
      likes: 5,
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "Great job! Can you share the recipes?",
      timestamp: "2h ago",
      likes: 3,
    },
  ]);

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
  }, []);

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      name: "You",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      content: commentText,
      timestamp: "Just now",
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText("");
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
      <Image source={{ uri: item.avatar }} className="w-9 h-9 rounded-full" />

      <View className="ml-3 flex-1">
        <View className="bg-[#F8F9FA] p-3 rounded-2xl">
          <Text className="font-semibold text-[14px] text-[#1A1E2B]">
            {item.name}
          </Text>
          <Text className="text-[#4A5568] mt-1 leading-5">{item.content}</Text>
        </View>

        <View className="flex-row mt-2 space-x-4">
          <Text className="text-[#8A8A8A] text-[11px] font-medium">
            {item.timestamp}
          </Text>
          <TouchableOpacity>
            <Text className="text-[#8A8A8A] text-[11px] font-medium">
              Like ({item.likes})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-[#8A8A8A] text-[11px] font-medium">
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            Post Details
          </Text>

          <View className="w-10" />
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
                source={{
                  uri: "https://randomuser.me/api/portraits/women/44.jpg",
                }}
                className="w-12 h-12 rounded-full border-2 border-[#4A7C59]"
              />

              <View className="ml-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[16px] font-semibold text-[#1A1E2B]">
                    Sarah Johnson
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
                    <Text className="text-[10px] font-medium text-[#4A7C59]">
                      Healthy Recipes
                    </Text>
                  </View>
                  <Text className="text-[11px] text-[#8A8A8A] ml-2">
                    2h ago
                  </Text>
                </View>
              </View>
            </View>

            {/* Post Text */}
            <Text className="text-[15px] text-[#4A5568] mt-4 leading-6">
              Just tried this amazing quinoa bowl recipe! Perfect for meal prep
              🥗
            </Text>

            {/* Post Image */}
            <View className="mt-4 rounded-2xl overflow-hidden">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                }}
                className="w-full h-[260px]"
                resizeMode="cover"
              />
            </View>

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
                Comments
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
                  No comments yet. Be the first!
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
            source={{
              uri: "https://randomuser.me/api/portraits/women/68.jpg",
            }}
            className="w-8 h-8 rounded-full mr-2"
          />

          <View className="flex-1 flex-row items-center bg-[#F5F7FA] rounded-full px-4 py-2">
            <TextInput
              placeholder="Write a comment..."
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
    </SafeAreaView>
  );
};

export default PostDetailsScreen;
