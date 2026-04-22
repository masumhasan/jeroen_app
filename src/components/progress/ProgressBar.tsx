import React from "react";
import { View } from "react-native";

const ProgressBar = ({ progress }: any) => {
  return (
    <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <View
        style={{ width: `${progress * 100}%` }}
        className="h-full bg-[#7b876d]"
      />
    </View>
  );
};

export default ProgressBar;
