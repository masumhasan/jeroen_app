import React from "react";
import { Text, View } from "react-native";
import PieChart from "react-native-pie-chart";

const widthAndHeight = 110;

export default function NutritionCard() {
  const totalCalories = 280;

  // Fix: Update series to be an array of objects with color and value
  const series = [
    { value: 8, color: "#7A866B" },
    { value: 24, color: "#BEBDB7" },
    { value: 18, color: "#E9C5A8" },
  ];

  // Remove sliceColor as it's now included in series
  // const sliceColor = ["#7A866B", "#BEBDB7", "#E9C5A8"];

  const data = [
    { label: "Protein", value: 8, percent: 11, color: "#7A866B" },
    { label: "Carbs", value: 24, percent: 33, color: "#BEBDB7" },
    { label: "Fat", value: 18, percent: 56, color: "#E9C5A8" },
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
