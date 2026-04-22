import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="shopping_list" options={{ headerShown: false }} />
      <Stack.Screen name="dishdetails" options={{ headerShown: false }} />
      <Stack.Screen name="cookinfmode" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
