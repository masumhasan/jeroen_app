import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, ChevronLeft, SendHorizontal, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  interpolate,
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

const avatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop";

// Message type definition
interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  image?: string;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ChatBubble = ({
  message,
  time,
  isMe,
  status,
  type,
  image,
  onDelete,
}: {
  message: string;
  time: string;
  isMe?: boolean;
  status?: "sending" | "sent" | "delivered" | "read";
  type?: "text" | "image";
  image?: string;
  onDelete?: () => void;
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

  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return <ActivityIndicator size={8} color="#EEF3E8" />;
      case "sent":
        return <Text className="text-[#EEF3E8] text-[8px]">✓</Text>;
      case "delivered":
        return <Text className="text-[#EEF3E8] text-[8px]">✓✓</Text>;
      case "read":
        return <Text className="text-[#1BC47D] text-[8px]">✓✓</Text>;
      default:
        return null;
    }
  };

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
            source={{ uri: avatar }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}

        <Swipeable
          renderRightActions={
            isMe
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
            style={[animatedStyle]}
            className={`max-w-[75%] ${type === "image" ? "p-1" : "px-4 py-3"} rounded-[18px] ${
              isMe
                ? "bg-[#98A08C] rounded-br-[6px]"
                : "bg-white rounded-bl-[6px] border border-[#ECECEC]"
            }`}
            style={{
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

            <View className="flex-row items-center justify-end mt-1 space-x-1">
              <Text
                className={`text-[10px] ${isMe ? "text-[#EEF3E8]" : "text-[#8E8E8E]"}`}
              >
                {time}
              </Text>
              {isMe && <View className="ml-1">{getStatusIcon()}</View>}
            </View>
          </AnimatedPressable>
        </Swipeable>
      </View>
    </Animated.View>
  );
};

const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      true,
    );

    dot2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, delay: 200 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      true,
    );

    dot3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, delay: 400 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      true,
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -5]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -5]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -5]) }],
  }));

  return (
    <View className="flex-row items-center space-x-1 px-4 py-3 bg-white rounded-[18px] rounded-bl-[6px] border border-[#ECECEC] max-w-[75%]">
      <Animated.View
        style={dot1Style}
        className="w-2 h-2 bg-[#98A08C] rounded-full"
      />
      <Animated.View
        style={dot2Style}
        className="w-2 h-2 bg-[#98A08C] rounded-full"
      />
      <Animated.View
        style={dot3Style}
        className="w-2 h-2 bg-[#98A08C] rounded-full"
      />
    </View>
  );
};

const AdminSupport = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello",
      time: "3:00 pm",
      isMe: true,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      text: "How can we help you",
      time: "3:01 pm",
      isMe: false,
      status: "read",
      type: "text",
    },
    {
      id: "3",
      text: "I need a emergency appointment.......... are you available now.",
      time: "3:01 pm",
      isMe: true,
      status: "read",
      type: "text",
    },
    {
      id: "4",
      text: "Yes we are available for you , at first book an appointment and come ,",
      time: "3:02 pm",
      isMe: false,
      status: "read",
      type: "text",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const headerScale = useSharedValue(1);

  useEffect(() => {
    // Simulate admin typing
    const typingTimer = setTimeout(() => {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const autoReply: Message = {
          id: Date.now().toString(),
          text: "Is there anything else I can help you with?",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: false,
          status: "sent",
          type: "text",
        };
        setMessages((prev) => [...prev, autoReply]);
        scrollToBottom();
      }, 3000);
    }, 5000);

    return () => clearTimeout(typingTimer);
  }, []);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
      status: "sending",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    scrollToBottom();

    // Simulate sending
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
        ),
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 2000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
        ),
      );
    }, 3000);
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
      base64: true,
    });

    setShowImagePicker(false);

    if (!result.canceled && result.assets[0]) {
      const imageMessage: Message = {
        id: Date.now().toString(),
        text: "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        status: "sending",
        type: "image",
        image: result.assets[0].uri,
      };

      setMessages((prev) => [...prev, imageMessage]);
      scrollToBottom();

      // Simulate image upload
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === imageMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        );
      }, 1500);
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
      const imageMessage: Message = {
        id: Date.now().toString(),
        text: "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        status: "sending",
        type: "image",
        image: result.assets[0].uri,
      };

      setMessages((prev) => [...prev, imageMessage]);
      scrollToBottom();

      // Simulate image upload
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === imageMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        );
      }, 1500);
    }
  };

  const deleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          },
          style: "destructive",
        },
      ],
    );
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
                source={{ uri: avatar }}
                className="w-10 h-10 rounded-full mr-3"
              />

              <View>
                <Text className="text-[15px] font-semibold text-[#111111]">
                  Admin Maria
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
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingBottom: 20,
              }}
              onContentSizeChange={() => scrollToBottom()}
            >
              {messages.map((msg, index) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  time={msg.time}
                  isMe={msg.isMe}
                  status={msg.status}
                  type={msg.type}
                  image={msg.image}
                  onDelete={() => deleteMessage(msg.id)}
                />
              ))}

              {isTyping && <TypingIndicator />}
            </ScrollView>

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
