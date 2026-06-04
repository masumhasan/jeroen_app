import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

const _layout = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack>
        <Stack.Screen
          name="createloginaccount"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="createaccountonboading"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="varify" options={{ headerShown: false }} />

      <Stack.Screen name="resetpassword" options={{ headerShown: false }} />
      <Stack.Screen name="forgot" options={{ headerShown: false }} />
      <Stack.Screen name="signuponpoarding" options={{ headerShown: false }} />
      <Stack.Screen name="finalpage" options={{ headerShown: false }} />
    </Stack>
    </>
  );
};

export default _layout;
