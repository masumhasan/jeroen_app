import React, { memo, useMemo, useRef } from "react";
import {
    FlatList,
    ListRenderItem,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const JS_DAY_TO_NAME: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};

interface DayTabsProps {
  selectedDayIndex: number;
  onDayChange: (index: number) => void;
  weekStartDay?: string;
}

export default function DayTabs({ selectedDayIndex, onDayChange, weekStartDay = "Monday" }: DayTabsProps) {
  const flatListRef = useRef<FlatList<DayItemType>>(null);

  const days = useMemo<DayItemType[]>(() => {
    const startIdx = ALL_DAYS.indexOf(weekStartDay);
    const start = startIdx >= 0 ? startIdx : 0;
    const orderedDays = [...ALL_DAYS.slice(start), ...ALL_DAYS.slice(0, start)];

    const today = new Date();
    const todayDayName = JS_DAY_TO_NAME[today.getDay()];
    const todayOrderIdx = orderedDays.indexOf(todayDayName);
    const offsetFromStart = todayOrderIdx >= 0 ? todayOrderIdx : 0;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - offsetFromStart);

    return orderedDays.map((dayName, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return {
        id: i,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        isToday: today.toDateString() === date.toDateString(),
      };
    });
  }, [weekStartDay]);

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
