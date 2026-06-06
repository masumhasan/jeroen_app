import { bookService } from "@/src/services/bookService";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RequestAccess() {
  const { bookSku, bookTitle } = useLocalSearchParams<{
    bookSku: string;
    bookTitle: string;
  }>();

  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("userData").then((raw) => {
      if (raw) {
        const user = JSON.parse(raw);
        if (user.email) setEmail(user.email);
      }
    });
  }, []);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Fout", "Voer een e-mailadres in.");
      return;
    }
    if (!note.trim()) {
      Alert.alert("Fout", "Voeg een toelichting toe aan je aanvraag.");
      return;
    }

    setSubmitting(true);
    try {
      await bookService.submitAccessRequest({
        bookSku: bookSku as string,
        bookTitle: bookTitle as string,
        requestEmail: trimmedEmail,
        note: note.trim(),
      });
      Alert.alert(
        "Aanvraag ingediend",
        "Je aanvraag is ontvangen. Je ontvangt een reactie van het team.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Er is iets misgegaan. Probeer het later opnieuw.";
      Alert.alert("Fout", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center mr-3"
            >
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text className="text-[18px] font-bold text-[#111]">
              Request Access
            </Text>
          </View>

          {/* Book info */}
          <View className="bg-[#F0F4EE] rounded-2xl p-4 mb-6">
            <Text className="text-[11px] font-bold uppercase tracking-widest text-[#7C8B74] mb-1">
              Boek
            </Text>
            <Text className="text-[15px] font-semibold text-[#222]">
              {bookTitle}
            </Text>
          </View>

          {/* Email input */}
          <Text className="text-[13px] font-semibold text-[#444] mb-2">
            E-mailadres waarmee je het boek hebt gekocht
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="jouw@email.nl"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-[#E0E0E0] rounded-xl px-4 py-3 text-[15px] text-[#222] mb-5"
            placeholderTextColor="#BBBBBB"
          />

          {/* Note input */}
          <Text className="text-[13px] font-semibold text-[#444] mb-2">
            Toelichting
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Bijv. Ik heb het boek 6 maanden geleden gekocht via het e-mailadres van mijn moeder. Graag toegang verlenen."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="border border-[#E0E0E0] rounded-xl px-4 py-3 text-[15px] text-[#222] mb-8"
            placeholderTextColor="#BBBBBB"
            style={{ minHeight: 120 }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-[#7C8B74] py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-[16px]">
                Aanvraag indienen
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
