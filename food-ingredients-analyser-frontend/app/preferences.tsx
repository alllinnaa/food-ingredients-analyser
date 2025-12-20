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
} from "react-native";

import { sendImageWithPreferences } from "../services/analysisService";

export default function PreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string; 
  
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

const sendToServer = async () => {
  if (!imageUri) {
    Alert.alert("Помилка", "Відсутнє фото продукту");
    return;
  }

  try {
    setLoading(true);

    const preferences = {
      individual_features: selected.filter((item) =>
        ["Алергени", "Непереносимість"].includes(item)
      ),
      dietary_restrictions: selected.filter((item) =>
        [
          "Діабет", "Вагітність", "Захворювання нирок", "Діти до 3 років",
          "Гіпертонія", "Гастрит", "Виразка", "Панкреатит",
          "Подагра", "Онкологія", "Ожиріння", "Анорексія",
        ].includes(item)
      ),
      religious_restrictions: selected.filter((item) =>
        ["Іслам", "Юдаїзм", "Індуїзм"].includes(item)
      ),
      lifestyle: selected.filter((item) =>
        ["Вегани", "Вегетаріанці", "Сироїди"].includes(item)
      ),
    };

    const data = await sendImageWithPreferences(imageUri, preferences);
    console.log("✅ Відповідь від сервера:", data);

    router.push({
      pathname: "/analysisResult",
      params: { result: JSON.stringify(data) }, 
    });
  } catch (error) {
    console.error("❌ Помилка при відправці:", error);
    Alert.alert("Помилка", "Не вдалося відправити дані на сервер.");
  } finally {
    setLoading(false);
  }
};


  const dietary = [
    "Діабет", "Вагітність", "Захворювання нирок", "Діти до 3 років",
    "Гіпертонія", "Гастрит", "Виразка", "Панкреатит", "Подагра", 
    "Онкологія", "Ожиріння", "Анорексія",
  ];

  const religious = ["Іслам", "Юдаїзм", "Індуїзм"];
  const lifestyle = ["Вегани", "Вегетаріанці", "Сироїди"];
  const individualFeatures = ["Алергени", "Непереносимість"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Додатковий аналіз</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.introText}>
          Обери, яку додаткову інформацію ти хочеш отримати про продукт.
        </Text>

        <Text style={styles.sectionTitle}>⚠️ Індивідуальні особливості</Text>
        {individualFeatures.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              selected.includes(item) && styles.optionSelected,
            ]}
            onPress={() => toggleSelection(item)}
          >
            <Text
              style={[
                styles.optionText,
                selected.includes(item) && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>🩺 Дієтичні обмеження</Text>
        {dietary.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              selected.includes(item) && styles.optionSelected,
            ]}
            onPress={() => toggleSelection(item)}
          >
            <Text
              style={[
                styles.optionText,
                selected.includes(item) && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>🙏 Релігійні обмеження</Text>
        {religious.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              selected.includes(item) && styles.optionSelected,
            ]}
            onPress={() => toggleSelection(item)}
          >
            <Text
              style={[
                styles.optionText,
                selected.includes(item) && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>🥦 Спосіб харчування</Text>
        {lifestyle.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              selected.includes(item) && styles.optionSelected,
            ]}
            onPress={() => toggleSelection(item)}
          >
            <Text
              style={[
                styles.optionText,
                selected.includes(item) && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}

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

// Стилі залишаються без змін
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: { fontSize: 22, color: "#2a5a43" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#2a5a43" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  introText: { fontSize: 16, color: "#444", marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2a5a43",
    marginVertical: 12,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  optionSelected: { borderColor: "#2a5a43", backgroundColor: "#d7f2e3" },
  optionText: { fontSize: 15, color: "#333" },
  optionTextSelected: { fontWeight: "700", color: "#2a5a43" },
  submitButton: {
    backgroundColor: "#2a5a43",
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  buttonPressed: { opacity: 0.8 },
});