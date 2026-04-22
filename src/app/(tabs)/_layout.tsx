import { Fonts } from "@/assets/fonts/fonts";
import {
  community,
  cookbook,
  home,
  profile,
  progress,
} from "@/assets/icons/icons";
import * as Font from "expo-font";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

export default function Layout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Inter: Fonts.Inter,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <Text />;
  }

  const icons: any = {
    home,
    community,
    cookbook,
    progress,
    profile,
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#FFFFFF]">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarActiveTintColor: "#89957F",
          tabBarInactiveTintColor: "#C9CAC5",

          tabBarStyle: {
            height: 70,
            paddingTop: 8,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#FFFFFF",
          },

          tabBarIcon: ({ color }) => {
            const icon = icons[route.name];

            return (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SvgXml xml={icon} width={22} height={22} color={color} />
              </View>
            );
          },

          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                fontFamily: "Inter",
                fontSize: 12,
                marginTop: 4,
                color: color,
                fontWeight: focused ? "700" : "400",
              }}
            >
              {route.name.charAt(0).toUpperCase() + route.name.slice(1)}
            </Text>
          ),
        })}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="community" />
        <Tabs.Screen name="cookbook" />
        <Tabs.Screen name="progress" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </SafeAreaView>
  );
}
