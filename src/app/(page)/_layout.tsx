import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="(community)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(cookbook)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
