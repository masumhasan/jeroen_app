import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const topics = [
  "Healthy Recipes",
  "Weekly Meal Plans",
  "Fitness Nutrition",
  "Meal Prep Ideas",
  "Weight Loss",
  "Muscle Building",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Gluten-Free",
];

const CreatePost = ({ navigation }: any) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter topics based on search
  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Request permissions for image picker
  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos",
      );
      return false;
    }
    return true;
  };

  // Handle image selection
  const handleAddPhoto = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert("Success", "Image selected successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Handle post submission
  const handlePost = async () => {
    // Validation
    if (!selectedTopic) {
      Alert.alert("Error", "Please select a topic");
      return;
    }

    if (!postContent.trim()) {
      Alert.alert("Error", "Please write something in your post");
      return;
    }

    setIsPosting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would typically send the post to your backend
      const postData = {
        topic: selectedTopic,
        content: postContent,
        image: selectedImage,
        timestamp: new Date().toISOString(),
      };

      console.log("Post created:", postData);

      Alert.alert("Success", "Your post has been created successfully!", [
        {
          text: "OK",
          onPress: () => navigation?.goBack() || navigation?.navigate("Home"),
        },
      ]);

      // Reset form
      setSelectedTopic("");
      setPostContent("");
      setSelectedImage(null);
    } catch (error) {
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Handle share meal plan
  const handleShareMealPlan = () => {
    Alert.alert("Share Meal Plan", "Would you like to share a meal plan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: () => {
          // Navigate to meal plan selection or creation
          navigation?.navigate("MealPlans");
        },
      },
    ]);
  };

  // Handle cancel/go back
  const handleCancel = () => {
    if (postContent || selectedTopic || selectedImage) {
      Alert.alert(
        "Discard Post",
        "You have unsaved changes. Are you sure you want to discard this post?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation?.goBack(),
          },
        ],
      );
    } else {
      navigation?.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-[#FFFFFF] px-5">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#EDEDED] items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#333" />
            </TouchableOpacity>

            <Text className="text-[20px] font-semibold text-[#222]">
              Create Post
            </Text>

            <TouchableOpacity
              onPress={handlePost}
              disabled={isPosting}
              className={`px-5 py-2 rounded-full ${
                isPosting ? "bg-[#A0A89B]" : "bg-[#7E8B73]"
              }`}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-medium">Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Select Topic */}
            <Text className="text-[15px] font-semibold text-[#333] mb-3">
              Select Topic *
            </Text>

            {/* Search */}
            <View className="flex-row items-center bg-white border border-[#E2E2E2] rounded-xl px-3 py-3 mb-4">
              <Feather name="search" size={18} color="#777" />
              <TextInput
                placeholder="Search topics"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="ml-2 flex-1 text-[14px]"
              />
            </View>

            {/* Topic Chips */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              {filteredTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedTopic === topic
                      ? "bg-[#7E8B73] border-[#7E8B73]"
                      : "border-[#D6D6D6]"
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      selectedTopic === topic ? "text-white" : "text-[#555]"
                    }`}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Image Preview */}
            {selectedImage && (
              <View className="mb-4 relative">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-40 rounded-2xl"
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                >
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* What's on your mind */}
            <Text className="text-[15px] font-semibold text-[#333] mb-3">
              {` What's on your mind? *`}
            </Text>

            <TextInput
              placeholder="Share your thoughts, recipes, or meal plans..."
              multiline
              value={postContent}
              onChangeText={setPostContent}
              textAlignVertical="top"
              className="bg-white border border-[#E2E2E2] rounded-2xl p-4 h-[150px] text-[14px]"
              maxLength={2000}
            />

            {/* Character counter */}
            <Text className="text-right text-[12px] text-[#777] mt-1">
              {postContent.length}/2000
            </Text>

            {/* Bottom Buttons */}
            <View className="flex-row justify-between mt-8 mb-6">
              {/* Add Photo */}
              <TouchableOpacity
                onPress={handleAddPhoto}
                className="flex-row items-center border border-[#8F9B83] rounded-xl px-5 py-4 w-[48%] justify-center"
              >
                <Feather name="image" size={18} color="#7E8B73" />
                <Text className="ml-2 text-[#7E8B73] font-medium">
                  {selectedImage ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>

              {/* Share Meal Plan */}
              <TouchableOpacity
                onPress={handleShareMealPlan}
                className="flex-row items-center border border-[#E0C97A] rounded-xl px-5 py-4 w-[48%] justify-center"
              >
                <Feather name="share-2" size={18} color="#B89B3C" />
                <Text className="ml-2 text-[#B89B3C] font-medium">
                  Share Meal Plan
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePost;
