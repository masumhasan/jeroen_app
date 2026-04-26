import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Camera, ChevronLeft, SendHorizontal, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { supportService, type SupportApiMessage } from "@/src/services/supportService";
import { resolveRecipeImageUrl } from "@/src/utils/imageUrl";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

/** Support agent image (incoming messages + header). */
const SUPPORT_AGENT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop";

/** When user has no profile image in stored user data. */
const DEFAULT_USER_AVATAR = "https://i.pravatar.cc/100?img=47";

/** Ensures footer (locale date + checkmarks) stays inside the bubble for short messages. */
const BUBBLE_MIN_WIDTH = 276;

// Message type definition
interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  image?: string;
  type: "text" | "image";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChatBubble = ({
  message,
  time,
  isMe,
  type,
  image,
  onDelete,
  myAvatarUri,
}: {
  message: string;
  time: string;
  isMe?: boolean;
  type?: "text" | "image";
  image?: string;
  onDelete?: () => void;
  /** Current user — shown on the right for outgoing bubbles. */
  myAvatarUri: string;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bubbleMaxWidth = Math.max(
    BUBBLE_MIN_WIDTH,
    Dimensions.get("window").width * 0.85 - 52
  );

  return (
    <Animated.View
      entering={isMe ? SlideInRight.springify() : SlideInLeft.springify()}
      className={`mb-4 ${isMe ? "items-end" : "items-start"}`}
    >
      <View
        className={`flex-row ${isMe ? "justify-end" : "justify-start"} items-end`}
      >
        {!isMe && (
          <Animated.Image
            entering={FadeInDown.delay(100)}
            source={{ uri: SUPPORT_AGENT_AVATAR }}
            className="w-8 h-8 rounded-full mr-2 shrink-0"
          />
        )}

        <Swipeable
          renderRightActions={
            isMe && onDelete
              ? () => (
                  <AnimatedPressable
                    onPress={onDelete}
                    className="bg-red-500 justify-center items-center w-16 rounded-l-[18px]"
                    entering={FadeInUp}
                  >
                    <Text className="text-white text-xs">Delete</Text>
                  </AnimatedPressable>
                )
              : undefined
          }
        >
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              animatedStyle,
              {
                maxWidth: bubbleMaxWidth,
                alignSelf: isMe ? "flex-end" : "flex-start",
              },
            ]}
          >
            {/* Inner box owns min width + overflow so timestamp cannot paint outside the bubble */}
            <View
              style={{
                minWidth: BUBBLE_MIN_WIDTH,
                maxWidth: bubbleMaxWidth,
                borderRadius: 18,
                borderBottomRightRadius: isMe ? 6 : 18,
                borderBottomLeftRadius: isMe ? 18 : 6,
                paddingHorizontal: type === "image" ? 4 : 16,
                paddingVertical: type === "image" ? 4 : 12,
                backgroundColor: isMe ? "#98A08C" : "#FFFFFF",
                borderWidth: isMe ? 0 : 1,
                borderColor: "#ECECEC",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: isMe ? 0.08 : 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {type === "image" && image ? (
                <Animated.Image
                  source={{ uri: image }}
                  className="w-48 h-48 rounded-[12px]"
                  entering={FadeInDown.duration(400)}
                />
              ) : (
                <Text
                  className={`text-[12px] leading-5 ${isMe ? "text-white" : "text-[#222222]"}`}
                >
                  {message}
                </Text>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  alignSelf: "stretch",
                  marginTop: 6,
                  flexWrap: "nowrap",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    lineHeight: 13,
                    flexShrink: 0,
                    color: isMe ? "#EEF3E8" : "#8E8E8E",
                    textAlign: "right",
                  }}
                >
                  {time}
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        </Swipeable>

        {isMe ? (
          <Animated.Image
            entering={FadeInDown.delay(100)}
            source={{ uri: myAvatarUri }}
            className="w-8 h-8 rounded-full ml-2 shrink-0"
          />
        ) : null}
      </View>
    </Animated.View>
  );
};

const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400";

function mapSupportToUiMessage(m: SupportApiMessage): Message {
  const hasImage = Boolean(m.imageUrl);
  const textBody = (m.body || "").trim();
  const displayText =
    hasImage && !textBody ? "" : textBody || (m.text === "[Image]" ? "" : m.text || "");
  return {
    id: m.id,
    text: displayText,
    time: m.time,
    isMe: m.from === "user",
    type: hasImage ? "image" : "text",
    image: hasImage ? resolveRecipeImageUrl(m.imageUrl, IMAGE_FALLBACK) : undefined,
  };
}

const AdminSupport = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingThread, setLoadingThread] = useState(true);
  const [myAvatarUri, setMyAvatarUri] = useState(DEFAULT_USER_AVATAR);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const headerScale = useSharedValue(1);

  const loadThread = useCallback(async (showFullSpinner: boolean) => {
    if (showFullSpinner) setLoadingThread(true);
    try {
      const data = await supportService.getThread();
      setMessages((data.messages || []).map(mapSupportToUiMessage));
    } catch {
      Alert.alert("Error", "Could not load your support conversation.");
    } finally {
      if (showFullSpinner) setLoadingThread(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void SecureStore.getItemAsync("userData")
        .then((raw) => {
          if (!raw || !active) return;
          try {
            const u = JSON.parse(raw) as Record<string, unknown>;
            const pic =
              (typeof u.avatar === "string" && u.avatar) ||
              (typeof u.profileImage === "string" && u.profileImage) ||
              (typeof u.photo === "string" && u.photo) ||
              "";
            if (pic.trim()) {
              setMyAvatarUri(resolveRecipeImageUrl(pic.trim(), DEFAULT_USER_AVATAR));
            }
          } catch {
            /* keep default */
          }
        })
        .catch(() => {});
      void supportService.markThreadRead().catch(() => {});
      void loadThread(true);
      const interval = setInterval(() => {
        if (active) void loadThread(false);
      }, 12000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [loadThread])
  );

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      const sent = await supportService.sendText(inputText.trim());
      setMessages((prev) => [...prev, mapSupportToUiMessage(sent)]);
      setInputText("");
      scrollToBottom();
      void loadThread(false);
    } catch {
      Alert.alert("Error", "Could not send your message. Please try again.");
    }
  };

  const guessMime = (uri: string) => {
    const lower = uri.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    return "image/jpeg";
  };

  const uploadSupportImage = async (asset: ImagePicker.ImagePickerAsset) => {
    const uri = asset.uri;
    const filename =
      uri.split("/").pop()?.split("?")[0] || `support-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || guessMime(uri);
    try {
      const sent = await supportService.sendWithImage({
        body: inputText.trim(),
        uri,
        mimeType,
        filename,
      });
      setMessages((prev) => [...prev, mapSupportToUiMessage(sent)]);
      setInputText("");
      scrollToBottom();
      void loadThread(false);
    } catch {
      Alert.alert("Error", "Could not send the image. Please try again.");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to send images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    setShowImagePicker(false);

    if (!result.canceled && result.assets[0]) {
      await uploadSupportImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your camera to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    setShowImagePicker(false);

    if (!result.canceled && result.assets[0]) {
      await uploadSupportImage(result.assets[0]);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View className="flex-1">
            {/* Header */}
            <Animated.View
              style={headerAnimatedStyle}
              className="px-4 pt-2 pb-3 flex-row items-center border-b border-[#F0F0F0]"
            >
              <AnimatedPressable
                onPress={() => router.back()}
                onPressIn={() => {
                  headerScale.value = withSpring(0.95);
                }}
                onPressOut={() => {
                  headerScale.value = withSpring(1);
                }}
                className="w-8 h-8 items-center justify-center mr-2"
              >
                <ChevronLeft size={22} color="#111111" />
              </AnimatedPressable>

              <Animated.Image
                entering={FadeInDown.delay(200).springify()}
                source={{ uri: SUPPORT_AGENT_AVATAR }}
                className="w-10 h-10 rounded-full mr-3"
              />

              <View>
                <Text className="text-[15px] font-semibold text-[#111111]">
                  Support Team
                </Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-[#1BC47D]" />
                  <Text className="text-[10px] text-[#1BC47D] ml-1">
                    Online
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Date divider */}
            <Animated.Text
              entering={FadeInDown}
              className="text-center text-[11px] text-[#9A9A9A] my-3"
            >
              Today
            </Animated.Text>

            {/* Messages */}
            {loadingThread ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#98A08C" />
                <Text className="text-[13px] text-[#888] mt-3">Loading conversation…</Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 14,
                  paddingBottom: 20,
                }}
                onContentSizeChange={() => scrollToBottom()}
              >
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg.text}
                    time={msg.time}
                    isMe={msg.isMe}
                    type={msg.type}
                    image={msg.image}
                    myAvatarUri={myAvatarUri}
                  />
                ))}
              </ScrollView>
            )}

            {/* Input area */}
            <Animated.View entering={FadeInUp} className="px-4 pb-4">
              <View className="h-[52px] rounded-full bg-[#F4F4F4] flex-row items-center px-4">
                <TextInput
                  ref={inputRef}
                  placeholder="Message"
                  placeholderTextColor="#9B9B9B"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSend}
                  className="flex-1 text-[13px] text-[#111111]"
                />

                <AnimatedPressable
                  onPress={() => setShowImagePicker(true)}
                  onPressIn={() => {
                    headerScale.value = withSpring(0.95);
                  }}
                  onPressOut={() => {
                    headerScale.value = withSpring(1);
                  }}
                  className="mr-3"
                >
                  <Camera size={18} color="#8A8A8A" />
                </AnimatedPressable>

                <AnimatedPressable
                  onPress={handleSend}
                  onPressIn={() => {
                    headerScale.value = withSpring(0.95);
                  }}
                  onPressOut={() => {
                    headerScale.value = withSpring(1);
                  }}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    inputText.trim() ? "bg-[#98A08C]" : "bg-[#C0C7B6]"
                  }`}
                  disabled={!inputText.trim()}
                >
                  <SendHorizontal size={18} color="#FFFFFF" />
                </AnimatedPressable>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>

        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowImagePicker(false)}
          >
            <Animated.View
              entering={FadeInUp}
              className="bg-white rounded-t-3xl p-6"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold">Send Photo</Text>
                <Pressable onPress={() => setShowImagePicker(false)}>
                  <X size={24} color="#111" />
                </Pressable>
              </View>

              <View className="flex-row justify-around">
                <Pressable onPress={takePhoto} className="items-center p-4">
                  <View className="w-16 h-16 bg-[#F4F4F4] rounded-full items-center justify-center mb-2">
                    <Camera size={24} color="#98A08C" />
                  </View>
                  <Text className="text-sm">Take Photo</Text>
                </Pressable>

                <Pressable onPress={pickImage} className="items-center p-4">
                  <View className="w-16 h-16 bg-[#F4F4F4] rounded-full items-center justify-center mb-2">
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                      }}
                      className="w-10 h-10 rounded-lg"
                    />
                  </View>
                  <Text className="text-sm">Choose from Library</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default AdminSupport;
