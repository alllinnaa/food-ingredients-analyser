import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
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

export default function PreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const images = params.images
    ? JSON.parse(params.images as string)
    : [];

  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSelection = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const sendToServer = async () => {
    if (!images || images.length === 0) {
      Alert.alert("Помилка", "Немає фото для аналізу");
      return;
    }

    try {
      setLoading(true);
      const preferences = [...selected];
      if (customInput.trim()) {
      preferences.push(customInput.trim());
      }

      const data = await sendImageWithPreferences(images, preferences); 

      console.log("✅ Відповідь:", data);

      router.push({
        pathname: "/analysisResult",
        params: { result: JSON.stringify(data) },
      });
    } catch (error) {
      console.error("❌ Помилка:", error);
      Alert.alert("Помилка", "Не вдалося відправити дані");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>На що перевірити?</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {/* СВОЄ */}
        <Text style={styles.customLabel}>Є особливий запит?</Text>
        <TextInput
          placeholder={
            "наприклад: чи можна при серцевій недостатності, чи сильно калорійний..."
          }
          value={customInput}
          onChangeText={setCustomInput}
          style={styles.textarea}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* КНОПКА */}
        <Pressable
          onPress={sendToServer}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Проаналізувати</Text>
          )}
        </Pressable>
      </ScrollView>
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
    paddingBottom: 40,
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
});
