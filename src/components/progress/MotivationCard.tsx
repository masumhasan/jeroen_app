import React from "react";
import { Text, View } from "react-native";
import { t } from "../../i18n";

type MotivationCardProps = {
  progressPercent: number;
};

const MotivationCard = ({ progressPercent }: MotivationCardProps) => {
  const bounded = Math.max(0, Math.min(100, Math.round(progressPercent)));

  return (
    <View className="border-2 border-[#7b876d] rounded-2xl p-4 bg-[#f7f8f4] items-center">
      <Text className="font-semibold text-lg text-[#5f6b55]">
        {t("motivationCard.title")}
      </Text>

      <Text className="text-center text-gray-500 text-sm mt-1">
        {t("motivationCard.message", { percent: String(bounded) })}
      </Text>

      <Text className="text-center text-gray-500 text-sm">
        {t("motivationCard.subMessage")}
      </Text>
    </View>
  );
};

export default MotivationCard;
