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
      <Stack.Screen name="edittheprofile" options={{ headerShown: false }} />
      <Stack.Screen name="setting" options={{ headerShown: false }} />
      <Stack.Screen name="Profilesetting" options={{ headerShown: false }} />
      <Stack.Screen name="adminsopport" options={{ headerShown: false }} />
      <Stack.Screen name="chengepassword" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="term" options={{ headerShown: false }} />
      <Stack.Screen name="policy" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
