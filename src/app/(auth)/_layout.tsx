import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="createloginaccount" />
      <Stack.Screen name="createaccountonboading" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="varify" />
      <Stack.Screen name="resetpassword" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="signuponpoarding" />
      <Stack.Screen name="finalpage" />
    </Stack>
  );
};

export default _layout;
