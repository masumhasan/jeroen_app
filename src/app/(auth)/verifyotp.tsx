import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";

const RESEND_SECONDS = 60;

const VerifyOtp = () => {
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
  }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const inputAnims = useRef([...Array(6)].map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
      Animated.sequence([
        Animated.timing(timerAnim, { toValue: 1.15, duration: 80, useNativeDriver: true }),
        Animated.timing(timerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp(newOtp);
    setErrorMsg("");

    Animated.sequence([
      Animated.timing(inputAnims[index], { toValue: 0.92, duration: 50, useNativeDriver: true }),
      Animated.spring(inputAnims[index], { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();

    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    try {
      await authService.sendOtp(params.email);
      setOtp(["", "", "", "", "", ""]);
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setErrorMsg("Kon de code niet opnieuw sturen. Probeer het later opnieuw.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    setErrorMsg("");
    try {
      await authService.verifyOtp(params.email, code);

      // OTP verified — proceed to onboarding
      router.replace({
        pathname: "/signuponpoarding",
        params: {
          firstName: params.firstName,
          lastName: params.lastName,
          phone: params.phone,
          email: params.email,
          password: params.password,
        },
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Verificatie mislukt. Probeer opnieuw.";
      setErrorMsg(msg);

      // Shake the inputs on error
      Animated.sequence([
        ...inputAnims.map((a) => Animated.timing(a, { toValue: 1.08, duration: 60, useNativeDriver: true })),
        ...inputAnims.map((a) => Animated.spring(a, { toValue: 1, friction: 4, useNativeDriver: true })),
      ]).start();
    } finally {
      setIsVerifying(false);
    }
  };

  const isComplete = otp.join("").length === 6;
  const maskedEmail = params.email
    ? params.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c)
    : "";

  return (
    <View className="flex-1 bg-white px-6 pt-14">
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-8"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color="#374151" />
      </TouchableOpacity>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        {/* Header */}
        <View className="mb-10">
          <View className="w-14 h-14 rounded-2xl bg-[#F3F5F1] items-center justify-center mb-5">
            <Ionicons name="mail-outline" size={28} color="#7C866E" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            E-mail verificatie
          </Text>
          <Text className="text-gray-500 text-base leading-6">
            We hebben een 6-cijferige code gestuurd naar{"\n"}
            <Text className="text-[#7C866E] font-semibold">{maskedEmail}</Text>
          </Text>
        </View>

        {/* OTP Inputs */}
        <View className="flex-row justify-between mb-6">
          {otp.map((digit, index) => (
            <Animated.View key={index} style={{ transform: [{ scale: inputAnims[index] }] }}>
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                style={{
                  width: 48,
                  height: 56,
                  borderWidth: 2,
                  borderRadius: 14,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "700",
                  borderColor: errorMsg ? "#ef4444" : digit ? "#7C866E" : "#E5E7EB",
                  backgroundColor: digit ? "#F3F5F1" : "#FAFAFA",
                  color: "#1F2937",
                }}
                selectionColor="#7C866E"
              />
            </Animated.View>
          ))}
        </View>

        {/* Error message */}
        {errorMsg ? (
          <View className="flex-row items-center mb-4 bg-red-50 rounded-xl px-4 py-3">
            <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-2 flex-1">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Timer / Resend */}
        <Animated.View
          className="flex-row justify-center items-center mb-8"
          style={{ transform: [{ scale: timerAnim }] }}
        >
          {!canResend ? (
            <Text className="text-gray-400 text-base">
              Code opnieuw sturen in{" "}
              <Text className="text-[#7C866E] font-semibold">{formatTime(timer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
              {isResending ? (
                <ActivityIndicator size="small" color="#7C866E" />
              ) : (
                <Text className="text-[#7C866E] text-base font-semibold">
                  Code opnieuw sturen
                </Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Verify Button */}
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            onPressIn={() =>
              Animated.spring(buttonScaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 150, friction: 3 }).start()
            }
            onPressOut={() =>
              Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 3 }).start()
            }
            onPress={handleVerify}
            disabled={!isComplete || isVerifying}
            activeOpacity={0.9}
            style={{
              backgroundColor: isComplete && !isVerifying ? "#7C866E" : "#D1D5DB",
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Bevestigen</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default VerifyOtp;
