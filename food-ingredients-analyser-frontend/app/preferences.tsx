import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";

import { sendImageWithPreferences } from "../services/analysisService";

const TAGS = [
  "горіхи",
  "арахіс",
  "глютен",
  "лактоза",
  "яйця",
  "сою",
  "морепродукти",
  "сульфіти",
  "ароматизатори",
  "барвники",
  "консерванти",
  "підсилювачі смаку",
  "кофеїн",
  "пальмова олія",
  "трансжири",
  "шкідливі E-добавки",
  "ГМО",
  "цукор",
  "сіль",
  "чи можна при діабеті",
  "чи можна при вагітності",
  "чи можна дітям",
];

const LOADING_MESSAGES = [
  "Читаємо склад продукту...",
  "Аналізуємо інгредієнти...",
  "Перевіряємо на шкідливі речовини...",
  "Майже готово...",
];

export default function PreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const images = params.images ? JSON.parse(params.images as string) : [];

  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleSelection = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const cycleLoadingMessage = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
  };

  const sendToServer = async () => {
    if (!images || images.length === 0) {
      Alert.alert("Помилка", "Немає фото для аналізу");
      return;
    }

    const interval = setInterval(cycleLoadingMessage, 4000);

    try {
      setLoading(true);
      setLoadingMessageIndex(0);

      const preferences = [...selected];
      if (customInput.trim()) {
        preferences.push(customInput.trim());
      }

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Час очікування вичерпано")), 50000)
      );

      const data = await Promise.race([
        sendImageWithPreferences(images, preferences),
        timeout,
      ]);

      router.push({
        pathname: "/analysisResult",
        params: { result: JSON.stringify(data) },
      });
    } catch (error: any) {
      const message =
        error?.message === "Час очікування вичерпано"
          ? "Сервер не відповідає. Спробуйте ще раз"
          : "Не вдалося відправити дані, наразі високий попит на модель. Спробуйте ще раз через 1-2 хвилини";
      Alert.alert("Помилка", message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fbe9e7" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>На що перевірити?</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Text style={styles.introText}>
            Оберіть одне або кілька, або напишіть своє
          </Text>

          {/* ТЕГИ */}
          <View style={styles.tagsWrap}>
            {TAGS.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.tag,
                  selected.includes(item) && styles.tagSelected,
                ]}
                onPress={() => toggleSelection(item)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selected.includes(item) && styles.tagTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.customLabel}>Є особливий запит?</Text>
          <TextInput
            placeholder="наприклад: чи можна при серцевій недостатності, чи сильно калорійний..."
            placeholderTextColor="#999"
            value={customInput}
            onChangeText={setCustomInput}
            style={styles.textarea}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Pressable
            onPress={sendToServer}
            disabled={loading}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.submitText}>Проаналізувати</Text>
          </Pressable>
        </ScrollView>

        <Modal transparent visible={loading} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2a5a43" />
              <Animated.Text
                style={[styles.loadingMessage, { opacity: fadeAnim }]}
              >
                {LOADING_MESSAGES[loadingMessageIndex]}
              </Animated.Text>
              <Text style={styles.loadingHint}>
                Аналіз зазвичай займає 15–20 секунд
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fbe9e7" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: { fontSize: 22 },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 300,
  },

  introText: {
    fontSize: 14,
    marginBottom: 16,
    color: "#666",
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },

  tag: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderColor: "#ddd",
  },

  tagSelected: {
    backgroundColor: "#d7f2e3",
    borderColor: "#2a5a43",
  },

  tagText: {
    fontSize: 13,
    color: "#333",
  },

  tagTextSelected: {
    color: "#2a5a43",
    fontWeight: "600",
  },

  customLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },

  textarea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#ddd",
    fontSize: 14,
    minHeight: 80,
  },

  submitButton: {
    backgroundColor: "#2a5a43",
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 40,
    gap: 16,
  },

  loadingMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2a5a43",
    textAlign: "center",
  },

  loadingHint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});