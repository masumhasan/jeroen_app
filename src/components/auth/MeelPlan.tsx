import { Check } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { t } from "../../i18n";

const getMealPlans = () => [
  { id: "Breakfast", label: t("mealPlan.breakfast") },
  { id: "snack-1", label: t("mealPlan.snack1") },
  { id: "Lunch", label: t("mealPlan.lunch") },
  { id: "snack-2", label: t("mealPlan.snack2") },
  { id: "Dinner", label: t("mealPlan.dinner") },
  { id: "snack-3", label: t("mealPlan.snack3") },
];

interface Props {
  value: string[]; // Changed from string to string[]
  onChange: (value: string[]) => void; // Changed to pass array of selected IDs
}

const MeelPlan: React.FC<Props> = ({ value, onChange }) => {
  const toggleSelection = (planId: string) => {
    if (value.includes(planId)) {
      // Remove if already selected
      onChange(value.filter((id) => id !== planId));
    } else {
      // Add if not selected
      onChange([...value, planId]);
    }
  };

  return (
    <ScrollView className="flex-1 px-5 pt-8">
      <Text className="text-2xl font-bold text-[#1F1F28] mb-2">
        {t("mealPlan.title")}
      </Text>
      <Text className="text-[#7A7A7A] text-sm mb-6">
        {t("mealPlan.subtitle")}
      </Text>

      {getMealPlans().map((plan, index) => (
        <Animated.View
          key={plan.id}
          entering={FadeInUp.delay(index * 150)}
          className="mb-3"
        >
          <TouchableOpacity
            onPress={() => toggleSelection(plan.id)}
            className={`p-5 rounded-2xl border flex-row items-center justify-between ${
              value.includes(plan.id)
                ? "border-[#89957F] bg-[#F3F5F1]"
                : "border-[#E7E7E7] bg-white"
            }`}
          >
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-[#1F1F28]">
                {plan.label}
              </Text>
            </View>

            {/* Show checkmark when selected */}
            {value.includes(plan.id) && (
              <View className="w-6 h-6 rounded-full bg-[#89957F] items-center justify-center">
                <Check size={16} color="white" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

export default MeelPlan;
