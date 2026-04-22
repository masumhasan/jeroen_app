import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Verify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(54);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  // Individual input animations
  const inputAnims = useRef(
    [...Array(6)].map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    // Entrance animation
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

    // Auto focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 400);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);

        // Animate timer on each second
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
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Animate current input
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

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text) => {
    // Handle paste of 6-digit code
    const pastedCode = text.slice(0, 6).split("");
    if (pastedCode.length === 6) {
      setOtp(pastedCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(54);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Animate resend button
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 6) {
      // Animate verification
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
      router.replace("/resetpassword");

      // Handle verification logic here
      console.log("Verifying code:", code);
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

  const formatTime = (seconds) => {
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
          OTP Verification
        </Text>

        <Text className="text-gray-500 text-center mt-3 mb-12 text-base">
          Enter the 6-digit code sent to your email
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
                onPaste={(e) => handlePaste(e.nativeEvent.text)}
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
              Resend code in{" "}
              <Text className="text-[#7C866E] font-semibold">
                {formatTime(timer)}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-[#7C866E] text-base font-semibold">
                Resend Code
              </Text>
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
            disabled={otp.join("").length !== 6}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Verify Code
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Help Text */}
      </Animated.View>
    </View>
  );
};

export default Verify;
11;
