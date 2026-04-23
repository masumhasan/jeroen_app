import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { authService } from "../../../services/authService";

const PRIMARY = "#89957F";
const PRIMARY_LIGHT = "#F3F5F1";
const BORDER = "#E7E7E7";
const TEXT_DARK = "#1F1F28";
const TEXT_LIGHT = "#7A7A7A";
const BG = "#FFFFFF";

const Edittheprofile = () => {
  const [swiperIndex, setSwiperIndex] = useState(0);

  const [gender, setGender] = useState("Male");
  const [activity, setActivity] = useState("Moderate");
  const [goal, setGoal] = useState("Weight Loss");

  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const user = await authService.getMe();
        if (user) {
          setGender(user.gender || "Male");
          setActivity(user.activityLevel || "Moderate");
          setGoal(user.goal || "Weight Loss");
          setAge(user.age?.toString() || "");
          setHeight(user.height?.toString() || "");
          setWeight(user.weight?.toString() || "");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await authService.updateProfile({
        gender,
        activityLevel: activity,
        goal,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
      });
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const goNext = () => {
    if (swiperRef.current && swiperIndex < 2) {
      swiperRef.current.scrollBy(1, true);
    }
  };

  const swiperRef = React.useRef<any>(null);

  const steps = [
    { label: "Step 1 of 3", percent: "33%" },
    { label: "Step 2 of 3", percent: "66%" },
    { label: "Step 3 of 3", percent: "100%" },
  ];

  const progressWidth = ["33%", "66%", "100%"];

  const HeaderSection = () => (
    <View className="px-5 pt-2">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-5 w-8 h-8 items-start justify-center"
      >
        <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mb-2">
        <Text style={{ color: TEXT_LIGHT, fontSize: 12 }}>
          {steps[swiperIndex].label}
        </Text>
        <Text style={{ color: TEXT_LIGHT, fontSize: 12 }}>
          {steps[swiperIndex].percent}
        </Text>
      </View>

      <View
        style={{
          height: 5,
          width: "100%",
          backgroundColor: "#ECECEC",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: progressWidth[swiperIndex] as any,
            backgroundColor: PRIMARY,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );

  const BottomButton = ({
    title,
    onPress,
  }: {
    title: string;
    onPress?: () => void;
  }) => (
    <View className="px-5 pb-6">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: PRIMARY,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
            marginRight: 6,
          }}
        >
          {title}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const GenderButton = ({ label }: { label: string }) => {
    const active = gender === label;
    return (
      <TouchableOpacity
        onPress={() => setGender(label)}
        activeOpacity={0.85}
        style={{
          flex: 1,
          height: 44,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: active ? PRIMARY : BORDER,
          backgroundColor: active ? PRIMARY_LIGHT : "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: active ? PRIMARY : "#5A5A5A",
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const OptionCard = ({
    title,
    subtitle,
    active,
    onPress,
  }: {
    title: string;
    subtitle: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderWidth: 1,
        borderColor: active ? "#D9D39A" : BORDER,
        backgroundColor: active ? "#FAFAF5" : "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          color: TEXT_DARK,
          fontSize: 15,
          fontWeight: "600",
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: TEXT_LIGHT,
          fontSize: 11,
          lineHeight: 18,
        }}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  const GoalCard = ({
    title,
    active,
    onPress,
  }: {
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        width: "48%",
        height: 110,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: active ? PRIMARY : BORDER,
        backgroundColor: active ? PRIMARY : "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : "#4E4E4E",
          fontSize: 14,
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <HeaderSection />
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={false}
        scrollEnabled
        index={0}
        onIndexChanged={(index) => setSwiperIndex(index)}
      >
        {/* Page 1 */}
        <View style={{ flex: 1, backgroundColor: BG }}>
          <View className="flex-1 px-5 pt-8">
            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 24,
              }}
            >
              Basic Information
            </Text>

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 10,
                fontWeight: "500",
              }}
            >
              Gender
            </Text>

            <View className="flex-row gap-3 mb-5">
              <GenderButton label="Male" />
              <GenderButton label="Female" />
              <GenderButton label="Other" />
            </View>

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              Age
            </Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor="#A0A0A0"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 14,
                paddingHorizontal: 14,
                fontSize: 15,
                color: TEXT_DARK,
                marginBottom: 14,
              }}
            />

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              Height (cm)
            </Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="170"
              placeholderTextColor="#A0A0A0"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 14,
                paddingHorizontal: 14,
                fontSize: 15,
                color: TEXT_DARK,
                marginBottom: 14,
              }}
            />

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              Weight (kg)
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="70"
              placeholderTextColor="#A0A0A0"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 14,
                paddingHorizontal: 14,
                fontSize: 15,
                color: TEXT_DARK,
              }}
            />
          </View>
        </View>

        {/* Page 2 */}
        <View style={{ flex: 1, backgroundColor: BG }}>
          <View className="flex-1 px-5 pt-8">
            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 24,
              }}
            >
              Activity Level
            </Text>

            <OptionCard
              title="Sedentary"
              subtitle="Little to no exercise"
              active={activity === "Sedentary"}
              onPress={() => setActivity("Sedentary")}
            />

            <OptionCard
              title="Moderate"
              subtitle="Exercise 3-5 days/week"
              active={activity === "Moderate"}
              onPress={() => setActivity("Moderate")}
            />

            <OptionCard
              title="Active"
              subtitle="Exercise 6-7 days/week"
              active={activity === "Active"}
              onPress={() => setActivity("Active")}
            />
          </View>

          {/* <BottomButton title="Continue" onPress={goNext} /> */}
        </View>

        {/* Page 3 */}
        <View style={{ flex: 1, backgroundColor: BG }}>
          <View className="flex-1 px-5 pt-8">
            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 24,
              }}
            >
              Your Goal
            </Text>

            <View className="flex-row justify-between flex-wrap">
              <GoalCard
                title="Weight Loss"
                active={goal === "Weight Loss"}
                onPress={() => setGoal("Weight Loss")}
              />
              <GoalCard
                title="Weight Gain"
                active={goal === "Weight Gain"}
                onPress={() => setGoal("Weight Gain")}
              />
              <GoalCard
                title="Muscle Gain"
                active={goal === "Muscle Gain"}
                onPress={() => setGoal("Muscle Gain")}
              />
              <GoalCard
                title="Maintenance"
                active={goal === "Maintenance"}
                onPress={() => setGoal("Maintenance")}
              />
            </View>
          </View>
        </View>
      </Swiper>
      {swiperIndex < 2 ? (
        <BottomButton title="Continue" onPress={goNext} />
      ) : (
        <View className="px-5 pb-6">
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={isUpdating}
            activeOpacity={0.85}
            style={{
              backgroundColor: PRIMARY,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: isUpdating ? 0.7 : 1,
            }}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                    marginRight: 6,
                  }}
                >
                  Update
                </Text>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Edittheprofile;
