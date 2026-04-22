import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ChevronRight,
  CircleHelp,
  FileText,
  Lock,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const menuItems = [
  {
    id: 1,
    title: "Profile Setting",
    icon: User,
    onPress: () => router.push("/Profilesetting"),
  },
  {
    id: 2,
    title: "Support",
    icon: ShieldCheck,
    onPress: () => router.push("/adminsopport"),
  },
  {
    id: 3,
    title: "Change password",
    icon: Lock,
    onPress: () => router.push("/chengepassword"),
  },
  {
    id: 4,
    title: "About Us",
    icon: CircleHelp,
    onPress: () => router.push("/about"),
  },
  {
    id: 5,
    title: "Privacy Policy",
    icon: FileText,
    onPress: () => router.push("/policy"),
  },
  {
    id: 6,
    title: "Terms and Conditions",
    icon: FileText,
    onPress: () => router.push("/term"),
  },
];

const SettingRow = ({
  title,
  Icon,
  onPress,
}: {
  title: string;
  Icon: any;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-[#F1F1F1]"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-7 h-7 rounded-full items-center justify-center bg-[#F7F7F7]">
          <Icon size={14} color="#111111" strokeWidth={1.8} />
        </View>
        <Text className="text-[13px] text-[#1A1A1A] font-medium">{title}</Text>
      </View>

      <ChevronRight size={18} color="#111111" strokeWidth={1.8} />
    </Pressable>
  );
};

const setting = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-2">
        <View className="flex-row items-center gap-3 mb-8">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center"
          >
            <FontAwesome6 name="arrow-left-long" size={20} color="#0F0B18" />
          </Pressable>
          <Text className="text-[20px] font-semibold text-[#111111]">
            Setting
          </Text>
        </View>

        <View className="flex-1">
          {menuItems.map((item) => (
            <SettingRow
              key={item.id}
              title={item.title}
              Icon={item.icon}
              onPress={item.onPress}
            />
          ))}
        </View>

        <Pressable className="mb-5 h-[50px] rounded-xl bg-[#98A08C] flex-row items-center justify-between px-4">
          <View className="flex-row items-center gap-2">
            <LogOut size={16} color="#FFFFFF" />
            <Text className="text-white text-[13px] font-medium">Log Out</Text>
          </View>
          <ChevronRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default setting;
