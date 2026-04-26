import { router } from "expo-router";
import { Heart, MessageCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { communityService } from "@/src/services/communityService";

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
  /** Same format as post details (`toLocaleString`). */
  timestamp: string;
};

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  comments: FeedComment[];
  commentsLoading: boolean;
  commentText: string;
  onChangeCommentText: (text: string) => void;
  onSubmitComment: () => void;
};

/** Module-level component so typing does not remount the modal on each parent re-render. */
function CommentsModal({
  visible,
  onClose,
  comments,
  commentsLoading,
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
              <View className="flex-row mb-5">
                <Image
                  source={{
                    uri: "https://i.pravatar.cc/100?img=" + (item.id.charCodeAt(0) % 70),
                  }}
                  className="w-9 h-9 rounded-full"
                />
                <View className="ml-3 flex-1">
                  <View className="bg-[#F8F9FA] p-3 rounded-2xl">
                    <Text className="font-semibold text-[14px] text-[#1A1E2B]">{item.user}</Text>
                    <Text className="text-[#4A5568] mt-1 text-[14px] leading-5">{item.text}</Text>
                  </View>
                  <View className="flex-row mt-2 items-center flex-wrap">
                    <Text className="text-[#8A8A8A] text-[11px] font-medium mr-3">
                      {item.timestamp}
                    </Text>
                    <TouchableOpacity activeOpacity={0.7} className="mr-3">
                      <Text className="text-[#8A8A8A] text-[11px] font-medium">Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text className="text-[#8A8A8A] text-[11px] font-medium">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              commentsLoading ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator color="#8A957F" />
                </View>
              ) : (
                <Text className="text-center text-gray-500 py-8">
                  No comments yet. Be the first!
                </Text>
              )
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
  onAddComment?: (
    postId: string,
    content: string
  ) => Promise<{ commentCount: number; comment?: any } | void>;
}) {
  const [isLiked, setIsLiked] = useState(Boolean(post.likedByMe));
  const [likesCount, setLikesCount] = useState(Number(post.likeCount || 0));
  const [commentsCount, setCommentsCount] = useState(Number(post.commentCount || 0));
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    setComments([]);
    setCommentText("");
    setIsCommentsVisible(false);
  }, [post.id]);

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
          user: c.user?.fullName || "User",
          timestamp: commentTimestamp(c.createdAt),
        }));
        setComments(mapped);
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCommentsVisible, post.id]);

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
    const text = commentText.trim();
    try {
      if (onAddComment) {
        const data = await onAddComment(post.id, text);
        if (data) setCommentsCount(Number(data.commentCount ?? commentsCount + 1));
        if (data?.comment) {
          const c = data.comment;
          const row: FeedComment = {
            id: String(c.id),
            text: String(c.content ?? ""),
            user: c.user?.fullName || "You",
            timestamp: commentTimestamp(c.createdAt),
          };
          setComments((prev) => {
            if (prev.some((x) => x.id === row.id)) return prev;
            return [...prev, row];
          });
        } else {
          setComments((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text,
              user: "You",
              timestamp: commentTimestamp(new Date()),
            },
          ]);
        }
      } else {
        setCommentsCount(commentsCount + 1);
        setComments((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text,
            user: "You",
            timestamp: commentTimestamp(new Date()),
          },
        ]);
      }
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
        commentsLoading={commentsLoading}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        onSubmitComment={handleAddComment}
      />
    </>
  );
}
