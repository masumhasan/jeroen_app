import React from "react";
import { Text, View } from "react-native";

const ingredients = [
  "Almonds (20g)",
  "Walnuts (15g)",
  "Cashews (15g)",
  "Blueberries (50g)",
  "Strawberries (50g)",
  "Dark chocolate chips (10g, optional)",
];

const instructions = [
  "Combine all nuts in a small bowl.",
  "Wash berries and pat dry.",
  "Mix nuts and berries together.",
  "Add dark chocolate chips if desired.",
  "Portion into a snack container.",
  "Store in refrigerator if not consuming immediately.",
];

const DeatilsFull = () => {
  return (
    <View className="  pt-6">
      {/* Ingredients */}
      <Text className="text-xl font-semibold text-gray-800 mb-4 ">
        Ingredients
      </Text>

      <View className="flex-col  space-y-3">
        {ingredients.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center bg-[#E9E9E9] rounded-2xl mb-2 px-4 py-4"
          >
            <View className="w-8 h-8 rounded-full bg-[#DCDCDC] items-center justify-center mr-3">
              <Text className="text-gray-600 font-medium">{index + 1}</Text>
            </View>

            <Text className="text-gray-800 flex-1">{item}</Text>
          </View>
        ))}
      </View>

      {/* Instructions */}
      <Text className="text-xl font-semibold text-gray-800  mb-4">
        Instructions
      </Text>

      <View className="flex-col gap-[2%]  space-y-4">
        {instructions.map((step, index) => (
          <View key={index} className="flex-row">
            <View className="w-8 h-8 rounded-full bg-[#7A866F] items-center justify-center mr-3">
              <Text className="text-white font-semibold">{index + 1}</Text>
            </View>

            <Text className="text-gray-600 flex-1 leading-6">{step}</Text>
          </View>
        ))}
      </View>
      <View className="h-96" />
    </View>
  );
};

export default DeatilsFull;
