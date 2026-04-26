import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

type WeightTrendChartProps = {
  labels: string[];
  values: number[];
};

const WeightTrendChart = ({ labels, values }: WeightTrendChartProps) => {
  const safeValues = values.length > 0 ? values : [0];
  const safeLabels = labels.length > 0 ? labels : ["Week 1"];

  return (
    <Animated.View className="bg-[#FFFFFF] rounded-2xl p-4 mb-4 shadow-sm">
      <LinearGradient
        colors={["#ffffff", "#f8faf8"]}
        className="rounded-2xl px-[2%] py-2 shadow-sm border border-gray-100 overflow-hidden"
        style={{ elevation: 3 }}
      >
        <Text className="text-lg font-semibold mb-2">Weight Trend</Text>

        <LineChart
          data={{
            labels: safeLabels,
            datasets: [
              {
                data: safeValues,
              },
            ],
          }}
          width={screenWidth - 60}
          height={180}
          withDots
          withInnerLines
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: () => "#7b876d",
            labelColor: () => "#999",
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </LinearGradient>
    </Animated.View>
  );
};

export default WeightTrendChart;
