import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const term = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] px-4">
      {/* Header */}
      <View className="flex-row items-center justify-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-[#222]">
          Terms & Condition
        </Text>
      </View>

      {/* Content Card */}
      <View className="bg-[#D9D9D9] rounded-[25px] p-5 flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-[14px] text-[#333] leading-6 mb-5">
            gravida elit enim. lobortis, ex orci lobortis, Donec orci elit
            felis, luctus ultrices odio tincidunt cursus elit ex nisi vehicula.
            Morbi Nunc Morbi venenatis sollicitudin. tortor. dui non quam dui.
            nibh tortor. sit viverra maximus ipsum.
          </Text>

          <Text className="text-[14px] text-[#333] leading-6 mb-5">
            massa tincidunt massa non, Ut ex lobortis, nulla sit orci Nam massa
            viverra venenatis massa placerat In viverra laoreet massa Lorem at
            elit scelerisque Quisque viverra id ipsum risus quam Lorem id quis
            ultrices vel placerat dui. elit nec
          </Text>

          <Text className="text-[14px] text-[#333] leading-6 mb-5">
            lobortis, vehicula, tempor Quisque sed felis, vitae Sed varius dolor
            volutpat in sed non, massa sit porta nisi ex. porta nulla, turpis
            efficitur. Nunc dolor dolor id non est. lacus, varius ipsum
            placerat. elementum dignissim, Vestibulum
          </Text>

          <Text className="text-[14px] text-[#333] leading-6">
            quam efficitur. gravida non. lacus, vehicula, nec id commodo turpis
            Donec Nam faucibus quis elementum tincidunt tortor. orci adipiscing
            odio sed sollicitudin. eget quis faucibus diam Cras fringilla Nam
            Lorem adipiscing vel in Vestibulum
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default term;
