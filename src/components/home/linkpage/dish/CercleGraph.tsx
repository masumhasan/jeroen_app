import React from "react";
import { Text, View } from "react-native";
import PieChart from "react-native-pie-chart";

const widthAndHeight = 110;

interface Props {
  nutrition?: {
    kcal: number;
    khd: number;
    vetten: number;
    eiwitten: number;
    vezels: number;
  };
}

export default function NutritionCard({ nutrition }: Props) {
  const totalCalories = nutrition?.kcal || 0;
  const protein = nutrition?.eiwitten || 0;
  const carbs = nutrition?.khd || 0;
  const fat = nutrition?.vetten || 0;

  const proteinPct = totalCalories > 0 ? Math.round((protein * 4 / totalCalories) * 100) : 0;
  const carbsPct = totalCalories > 0 ? Math.round((carbs * 4 / totalCalories) * 100) : 0;
  const fatPct = totalCalories > 0 ? Math.round((fat * 9 / totalCalories) * 100) : 0;

  const series = [
    { value: Math.max(protein, 0.1), color: "#7A866B" },
    { value: Math.max(carbs, 0.1), color: "#BEBDB7" },
    { value: Math.max(fat, 0.1), color: "#E9C5A8" },
  ];

  const data = [
    { label: "Protein", value: protein, percent: proteinPct, color: "#7A866B" },
    { label: "Carbs", value: carbs, percent: carbsPct, color: "#BEBDB7" },
    { label: "Fat", value: fat, percent: fatPct, color: "#E9C5A8" },
  ];

  return (
    <View className="bg-[#F5F5F5] p-5 rounded-3xl mt-6">
      {/* Top Section */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-4xl font-bold text-[#7A866B]">
            {totalCalories}
          </Text>
          <Text className="text-[#7A7A8C] mt-1">Total Calories</Text>
        </View>

        <PieChart
          widthAndHeight={widthAndHeight}
          series={series}
          cover={0.65}
        />
      </View>

      {/* Nutrition List */}
      <View className="mt-6">
        {data.map((item, index) => (
          <View key={index} className="mb-5">
            {/* Label Row */}
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: item.color }}
                  className="w-3 h-3 rounded-full mr-2"
                />
                <Text className="text-base text-[#1F1F1F]">{item.label}</Text>
              </View>

              <Text className="text-[#6B6B80]">
                {item.value}g ({item.percent}%)
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-[#DADAE0] rounded-full overflow-hidden">
              <View
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                }}
                className="h-full rounded-full"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
