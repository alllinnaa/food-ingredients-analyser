import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AnalysisResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result?: string }>();

  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (params.result) {
        const parsed = JSON.parse(params.result);
        setData(parsed);
      } else {
        setError("Дані не отримані");
      }
    } catch (e) {
      console.error("❌ JSON error:", e);
      setError("Помилка обробки результату");
    }
  }, [params.result]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2a5a43" />
        <Text style={styles.loadingText}>Завантаження результату...</Text>
      </View>
    );
  }

  // Витягуємо дані з обгортки analysis_result, якщо вона прийшла з бекенду
  const resultData = data.analysis_result ? data.analysis_result : data;
  const checkError = resultData.error;

  // Якщо бекенд (або промпт) повернув помилку
  if (checkError) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorCard}>
          <Text style={styles.errorCardTitle}>Упс!</Text>
          <Text style={styles.errorCardText}>{checkError}</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Спробувати інше фото</Text>
        </Pressable>
      </View>
    );
  }

  // Беремо всі необхідні поля зі справжніх даних
  const {
    product_name,
    translated_product_name,
    user_note,
    ingredients = [],
  } = resultData;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Результат аналізу</Text>
        <View style={{ width: 44 }} />
      </View>
      {/* ПОПЕРЕДЖЕННЯ */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>🤖</Text>
        <Text style={styles.warningText}>
          Аналіз виконано штучним інтелектом. Результат може містити неточності. Будьте уважні та консультуйтесь з лікарем за потреби.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* БЛОК НАЗВИ ПРОДУКТУ */}
        {(!!product_name || !!translated_product_name) && (
          <View style={styles.titleContainer}>
            {!!product_name && (
              <Text style={styles.productName}>{product_name}</Text>
            )}
            {!!translated_product_name && (
              <Text style={styles.translatedName}>
                {translated_product_name}
              </Text>
            )}
          </View>
        )}

        {/* ВІДПОВІДЬ НА ЗАПИТ КОРИСТУВАЧА (Preferences) */}
        {!!user_note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>🎯 Ваш запит</Text>
            <Text style={styles.noteText}>{user_note}</Text>
          </View>
        )}

        {/* СПИСОК ІНГРЕДІЄНТІВ */}
        {ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>
              🥣 Склад продукту ({ingredients.length})
            </Text>

            {ingredients.map((item: any, i: number) => (
              <View key={i} style={styles.ingredientCard}>
                <View style={styles.ingredientHeader}>
                  <Text style={styles.ingredientName}>
                    {i + 1}. {item.name}
                  </Text>
                  {!!item.translated_name && (
                    <Text style={styles.ingredientTranslated}>
                      {item.translated_name}
                    </Text>
                  )}
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.propertiesContainer}>
                  <View style={styles.propertyRow}>
                    <Text style={styles.propertyIcon}>✅</Text>
                    <Text style={styles.propertyText}>{item.benefits}</Text>
                  </View>
                  <View style={styles.propertyRow}>
                    <Text style={styles.propertyIcon}>⚠️</Text>
                    <Text style={styles.propertyText}>{item.harm}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* КНОПКА ПОВЕРНЕННЯ */}
        <Pressable
          onPress={() => router.push("/")}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.primaryButtonText}>Аналізувати інший продукт</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbe9e7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbe9e7",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#2a5a43",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: "#ffebee",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  errorCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#c62828",
    marginBottom: 8,
  },
  errorCardText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    elevation: 2,
  },
  backIcon: { fontSize: 22, color: "#2a5a43" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#2a5a43" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  /* ТИТУЛКА ПРОДУКТУ */
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a3a2a",
    textAlign: "center",
  },
  translatedName: {
    fontSize: 16,
    color: "#587b64",
    marginTop: 4,
    textAlign: "center",
    fontStyle: "italic",
  },

  /* КАРТКА USER NOTE */
  noteCard: {
    backgroundColor: "#d7f2e3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2a5a43",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2a5a43",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    color: "#1a3a2a",
    lineHeight: 22,
  },

  /* СЕКЦІЯ ІНГРЕДІЄНТІВ */
  ingredientsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2a5a43",
    marginBottom: 12,
  },
  ingredientCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  ingredientHeader: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  ingredientName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333",
  },
  ingredientTranslated: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  propertiesContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  propertyIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  propertyText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  /* КНОПКИ */
  button: {
    backgroundColor: "#2a5a43",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#ec7d39",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ec7d39",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f7d6d2",
    borderLeftWidth: 4,
    borderLeftColor: "#a1949d",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#795548",
    lineHeight: 18,
  },
});