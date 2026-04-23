import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    ListRenderItem,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Define types for the day item
interface DayItemType {
  id: number;
  day: string;
  date: string;
  isToday: boolean;
}

interface DayItemProps {
  item: DayItemType;
  index: number;
  active: number;
  onPress: (index: number) => void;
  isToday: boolean;
}

const DayItem = memo<DayItemProps>(
  ({ item, index, active, onPress, isToday }) => (
    <TouchableOpacity
      onPress={() => onPress(index)}
      className={`px-4 py-3 rounded-xl items-center min-w-[70px] mx-1 ${
        active === index
          ? "bg-[#7A8B6F]"
          : isToday
            ? "bg-[#7A8B6F]/20"
            : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          active === index
            ? "text-white"
            : isToday
              ? "text-[#7A8B6F]"
              : "text-gray-700"
        }`}
      >
        {item.day}
      </Text>

      <Text
        className={`text-xs ${
          active === index
            ? "text-white"
            : isToday
              ? "text-[#7A8B6F]"
              : "text-gray-500"
        }`}
      >
        {item.date}
      </Text>

      {isToday && active !== index && (
        <View className="absolute -top-1 -right-1 w-2 h-2 bg-[#7A8B6F] rounded-full" />
      )}
    </TouchableOpacity>
  ),
);

DayItem.displayName = "DayItem";

interface DayTabsProps {
  selectedDayIndex: number;
  onDayChange: (index: number) => void;
}

export default function DayTabs({ selectedDayIndex, onDayChange }: DayTabsProps) {
  const flatListRef = useRef<FlatList<DayItemType>>(null);
  
  const days = useMemo<DayItemType[]>(() => {
    const today = new Date();
    // Get the Monday of the current week
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const daysArray: DayItemType[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      daysArray.push({
        id: i,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        isToday: new Date().toDateString() === date.toDateString(),
      });
    }

    return daysArray;
  }, []);

  const handlePress = (index: number): void => {
    onDayChange(index);
    flatListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const getItemLayout = (
    data: ArrayLike<DayItemType> | null | undefined,
    index: number,
  ) => ({
    length: 78,
    offset: 78 * index,
    index,
  });

  const renderItem: ListRenderItem<DayItemType> = ({ item, index }) => (
    <DayItem
      item={item}
      index={index}
      active={selectedDayIndex}
      onPress={handlePress}
      isToday={item.isToday}
    />
  );

  return (
    <View className="w-full mt-4">
      <FlatList<DayItemType>
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={days}
        keyExtractor={(item: DayItemType) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}
