import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { authService } from "../../../services/authService";
import { t } from "../../../i18n";

const PRIMARY = "#89957F";
const PRIMARY_LIGHT = "#F3F5F1";
const BORDER = "#E7E7E7";
const TEXT_DARK = "#1F1F28";
const TEXT_LIGHT = "#7A7A7A";
const BG = "#FFFFFF";

const GENDER_OPTIONS = [
  { label: t("editProfile.genders.male"), value: "Male" },
  { label: t("editProfile.genders.female"), value: "Female" },
  { label: t("editProfile.genders.other"), value: "Other" },
];

const ACTIVITY_OPTIONS = [
  { label: t("editProfile.activities.sedentary"), subtitle: t("editProfile.activities.sedentaryDesc"), value: "Sedentary" },
  { label: t("editProfile.activities.moderate"), subtitle: t("editProfile.activities.moderateDesc"), value: "Moderate" },
  { label: t("editProfile.activities.active"), subtitle: t("editProfile.activities.activeDesc"), value: "Active" },
];

const GOAL_OPTIONS = [
  { label: t("editProfile.goals.weightLoss"), value: "Weight Loss" },
  { label: t("editProfile.goals.weightGain"), value: "Weight Gain" },
  { label: t("editProfile.goals.muscleGain"), value: "Muscle Gain" },
  { label: t("editProfile.goals.maintenance"), value: "Maintenance" },
];

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
        Alert.alert(t("editProfile.alerts.errorTitle"), t("editProfile.alerts.fetchFailed"));
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
      Alert.alert(t("editProfile.alerts.successTitle"), t("editProfile.alerts.updateSuccess"));
      router.back();
    } catch (error: any) {
      Alert.alert(t("editProfile.alerts.errorTitle"), error.response?.data?.message || t("editProfile.alerts.updateFailed"));
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
    { label: t("editProfile.step1"), percent: t("editProfile.percent1") },
    { label: t("editProfile.step2"), percent: t("editProfile.percent2") },
    { label: t("editProfile.step3"), percent: t("editProfile.percent3") },
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

  const GenderButton = ({ label, value }: { label: string; value: string }) => {
    const active = gender === value;
    return (
      <TouchableOpacity
        onPress={() => setGender(value)}
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
              {t("editProfile.basicInformation")}
            </Text>

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 10,
                fontWeight: "500",
              }}
            >
              {t("editProfile.gender")}
            </Text>

            <View className="flex-row gap-3 mb-5">
              {GENDER_OPTIONS.map((opt) => (
                <GenderButton key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </View>

            <Text
              style={{
                color: TEXT_DARK,
                fontSize: 13,
                marginBottom: 8,
                fontWeight: "500",
              }}
            >
              {t("editProfile.age")}
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
              {t("editProfile.height")}
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
              {t("editProfile.weight")}
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
              {t("editProfile.activityLevel")}
            </Text>

            {ACTIVITY_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                title={opt.label}
                subtitle={opt.subtitle}
                active={activity === opt.value}
                onPress={() => setActivity(opt.value)}
              />
            ))}
          </View>
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
              {t("editProfile.yourGoal")}
            </Text>

            <View className="flex-row justify-between flex-wrap">
              {GOAL_OPTIONS.map((opt) => (
                <GoalCard
                  key={opt.value}
                  title={opt.label}
                  active={goal === opt.value}
                  onPress={() => setGoal(opt.value)}
                />
              ))}
            </View>
          </View>
        </View>
      </Swiper>
      {swiperIndex < 2 ? (
        <BottomButton title={t("editProfile.continue")} onPress={goNext} />
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
                  {t("editProfile.update")}
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
