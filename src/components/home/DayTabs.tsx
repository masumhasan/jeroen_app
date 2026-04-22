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

// Props for DayItem component
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

// Set display name for debugging
DayItem.displayName = "DayItem";

export default function DayTabs() {
  const [active, setActive] = useState<number>(0);
  const flatListRef = useRef<FlatList<DayItemType>>(null);
  const { width: screenWidth } = Dimensions.get("window");
  const days = useMemo<DayItemType[]>(() => {
    const today = new Date();
    const daysArray: DayItemType[] = [];
    for (let i = -180; i <= 180; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      daysArray.push({
        id: i + 180,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        isToday: i === 0,
      });
    }

    return daysArray;
  }, []);

  // Find and set today's index instantly
  useEffect(() => {
    const todayIdx = days.findIndex((day: DayItemType) => day.isToday);
    setActive(todayIdx);

    // Scroll to today immediately
    if (flatListRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIdx,
          viewPosition: 0.5,
          animated: false,
        });
      });
    }
  }, [days]);

  const handlePress = (index: number): void => {
    setActive(index);
    flatListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  // Fixed getItemLayout with proper typing
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
      active={active}
      onPress={handlePress}
      isToday={item.isToday}
    />
  );

  return (
    <View className="w-full">
      <FlatList<DayItemType>
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={days}
        keyExtractor={(item: DayItemType) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={3}
        removeClippedSubviews={true}
        decelerationRate="fast"
      />
    </View>
  );
}
