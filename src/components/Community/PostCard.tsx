import { router } from "expo-router";
import { Heart, MessageCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FeedComment = {
  id: string;
  text: string;
  user: string;
  time: string;
};

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  comments: FeedComment[];
  commentText: string;
  onChangeCommentText: (text: string) => void;
  onSubmitComment: () => void;
};

/** Module-level component so typing does not remount the modal on each parent re-render. */
function CommentsModal({
  visible,
  onClose,
  comments,
  commentText,
  onChangeCommentText,
  onSubmitComment,
}: CommentsModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500">Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View className="flex-row mb-4">
                <Image
                  source={{
                    uri: "https://i.pravatar.cc/100?img=" + (item.id.charCodeAt(0) % 70),
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-sm mr-2">{item.user}</Text>
                    <Text className="text-xs text-gray-500">{item.time}</Text>
                  </View>
                  <Text className="text-sm text-gray-700">{item.text}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-8">
                No comments yet. Be the first!
              </Text>
            }
          />
          <View className="p-4 border-t border-gray-200 flex-row">
            <TextInput
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2"
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={onChangeCommentText}
            />
            <TouchableOpacity
              onPress={onSubmitComment}
              className="bg-[#8A957F] px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PostCard({
  post,
  onToggleLike,
  onAddComment,
}: {
  post: any;
  onToggleLike?: (postId: string) => Promise<{ likedByMe: boolean; likeCount: number } | void>;
  onAddComment?: (postId: string, content: string) => Promise<{ commentCount: number } | void>;
}) {
  const [isLiked, setIsLiked] = useState(Boolean(post.likedByMe));
  const [likesCount, setLikesCount] = useState(Number(post.likeCount || 0));
  const [commentsCount, setCommentsCount] = useState(Number(post.commentCount || 0));
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<FeedComment[]>([]);

  const handleLike = async () => {
    if (!onToggleLike) return;
    try {
      const data = await onToggleLike(post.id);
      if (data) {
        setIsLiked(Boolean(data.likedByMe));
        setLikesCount(Number(data.likeCount || 0));
      }
    } catch {
      // no-op
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Error", "Please write a comment");
      return;
    }
    try {
      if (onAddComment) {
        const data = await onAddComment(post.id, commentText.trim());
        if (data) setCommentsCount(Number(data.commentCount || commentsCount + 1));
      } else {
        setCommentsCount(commentsCount + 1);
      }
      const newComment: FeedComment = {
        id: Date.now().toString(),
        text: commentText,
        user: "You",
        time: "Just now",
      };
      setComments([...comments, newComment]);
      setCommentText("");
    } catch {
      Alert.alert("Error", "Failed to add comment");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/detalspost", params: { postId: post.id } })}
        className="bg-white mx-4 mb-4 rounded-2xl border border-gray-200 overflow-hidden"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center p-3">
          <Image
            source={{ uri: post.userAvatar || "https://i.pravatar.cc/100" }}
            className="w-9 h-9 rounded-full mr-2"
          />

          <View>
            <Text className="font-semibold text-sm">{post.name}</Text>

            <Text className="text-xs text-gray-500">
              {post.role} • {post.time}
            </Text>
          </View>
        </View>

        <Text className="px-3 pb-3 text-sm text-gray-700">{post.text}</Text>

        {post.image ? <Image source={{ uri: post.image }} className="w-full h-56" /> : null}

        <View className="flex-row items-center p-3">
          <TouchableOpacity className="flex-row items-center mr-6" onPress={handleLike}>
            <Heart
              size={18}
              color={isLiked ? "#ef4444" : "#777"}
              fill={isLiked ? "#ef4444" : "transparent"}
            />
            <Text className="ml-1 text-gray-600 text-sm">{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setIsCommentsVisible(true)}
          >
            <MessageCircle size={18} color="#777" />
            <Text className="ml-1 text-gray-600 text-sm">{commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        comments={comments}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        onSubmitComment={handleAddComment}
      />
    </>
  );
}
