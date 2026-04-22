import { BookOpen, Home, TrendingUp, User, Users } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  return (
    <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex-row justify-around py-3">
      <TouchableOpacity>
        <Home size={22} color="#aaa" />
      </TouchableOpacity>

      <TouchableOpacity>
        <Users size={22} color="#89957F" />
      </TouchableOpacity>

      <TouchableOpacity>
        <BookOpen size={22} color="#aaa" />
      </TouchableOpacity>

      <TouchableOpacity>
        <TrendingUp size={22} color="#aaa" />
      </TouchableOpacity>

      <TouchableOpacity>
        <User size={22} color="#aaa" />
      </TouchableOpacity>
    </View>
  );
}
