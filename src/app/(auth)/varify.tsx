import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { t } from "../../i18n";
import {
  Alert,
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { authService } from "../../services/authService";

const Verify = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  const inputAnims = useRef(
    [...Array(6)].map(() => new Animated.Value(1)),
  ).current;

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

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 400);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);

        Animated.sequence([
          Animated.timing(timerAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(timerAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timer, canResend]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    Animated.sequence([
      Animated.timing(inputAnims[index], {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(inputAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      await authService.sendForgotOtp(email || "");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Opnieuw verzenden mislukt.";
      Alert.alert("Fout", msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setIsVerifying(true);
    try {
      const result = await authService.verifyForgotOtp(email || "", code);

      Animated.sequence([
        Animated.parallel(
          inputAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
          ),
        ),
        Animated.parallel(
          inputAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();

      router.replace({
        pathname: "/resetpassword",
        params: { email: email || "", resetToken: result.resetToken },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Verificatie mislukt. Probeer het opnieuw.";
      Alert.alert("Fout", msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 3,
    }).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <Text className="text-2xl font-semibold text-gray-800 text-center">
          {t("verify.title")}
        </Text>

        <Text className="text-gray-500 text-center mt-3 mb-12 text-base">
          {t("verify.subtitle")}
        </Text>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-center space-x-3 gap-[2%] mb-8">
          {otp.map((digit, index) => (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale: inputAnims[index] }],
              }}
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                className={`w-14 h-14 border-2 rounded-xl text-center text-xl font-semibold
                  ${digit ? "border-[#7C866E] bg-[#7C866E] bg-opacity-5" : "border-gray-200"}
                `}
                style={{
                  backgroundColor: digit ? "#F5F7F4" : "white",
                }}
                selectionColor="#7C866E"
              />
            </Animated.View>
          ))}
        </View>

        {/* Timer and Resend */}
        <Animated.View
          className="flex-row justify-center items-center mb-8"
          style={{
            transform: [{ scale: timerAnim }],
          }}
        >
          {!canResend ? (
            <Text className="text-gray-400 text-base">
              {t("verify.resendIn")}{" "}
              <Text className="text-[#7C866E] font-semibold">
                {formatTime(timer)}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator color="#7C866E" />
              ) : (
                <Text className="text-[#7C866E] text-base font-semibold">
                  {t("verify.resendCode")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Verify Button */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScaleAnim }],
          }}
        >
          <TouchableOpacity
            className={`py-4 rounded-full ${otp.join("").length === 6 ? "bg-[#7C866E]" : "bg-gray-300"}`}
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleVerify}
            disabled={otp.join("").length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {t("verify.verifyButton")}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Verify;
