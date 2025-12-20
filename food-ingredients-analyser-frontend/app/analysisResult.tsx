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
        console.log("✅ Отримані дані на екрані:", parsed);
        setData(parsed);
      } else {
        setError("Дані не отримані");
      }
    } catch (e) {
      console.error("❌ Помилка парсингу:", e);
      setError("Помилка обробки результатів");
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
        <Text style={{ marginTop: 10, color: "#2a5a43" }}>
          Завантаження результату...
        </Text>
      </View>
    );
  }

  const analysis = data.analysis_result || {};
  const {
    product_name,
    consumer_explanation,
    ingredients = [],
    allergens = [],
    intolerances = [],
    restrictions = {},
  } = analysis;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Результат аналізу</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Назва продукту */}
        {product_name && <Text style={styles.productName}>{product_name}</Text>}

        {/* Пояснення споживачу */}
        {consumer_explanation && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>ℹ️ Пояснення споживачу</Text>
            <Text style={styles.text}>{consumer_explanation}</Text>
          </View>
        )}

        {/* Інгредієнти */}
        {ingredients.length > 0 && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🥣 Інгредієнти</Text>
            {ingredients.map((item: any, i: number) => (
              <View key={i} style={styles.ingredientBox}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.textSmall}>📘 {item.description}</Text>
                )}
                {item.benefits && (
                  <Text style={styles.textSmall}>✅ {item.benefits}</Text>
                )}
                {item.harm && (
                  <Text style={styles.textSmall}>⚠️ {item.harm}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Алергени */}
        {allergens?.length > 0 && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>⚠️ Алергени</Text>
            {allergens.map((a: any, i: number) => (
              <Text key={i} style={styles.textSmall}>
                • {a.ingredient} — {a.allergen_type}
              </Text>
            ))}
          </View>
        )}

        {/* Непереносимості */}
        {intolerances?.length > 0 && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🚫 Непереносимість</Text>
            {intolerances.map((n: any, i: number) => (
              <Text key={i} style={styles.textSmall}>
                • {n.ingredient} — {n.intolerance_type}
              </Text>
            ))}
          </View>
        )}

        {/* Обмеження */}
        {restrictions && Object.keys(restrictions).length > 0 && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🥗 Обмеження</Text>

            {restrictions.dietary && (
              <>
                <Text style={styles.subsection}>Дієтичні:</Text>
                {Object.entries(restrictions.dietary).map(([key, val]: any) => (
                  <Text key={key} style={styles.textSmall}>
                    • {translateKey(key)}: {val.suitable} — {val.explanation}
                  </Text>
                ))}
              </>
            )}

            {restrictions.religious && (
              <>
                <Text style={styles.subsection}>Релігійні:</Text>
                {Object.entries(restrictions.religious).map(([key, val]: any) => (
                  <Text key={key} style={styles.textSmall}>
                    • {translateKey(key)}: {val.suitable} — {val.explanation}
                  </Text>
                ))}
              </>
            )}

            {restrictions.eating_style && (
              <>
                <Text style={styles.subsection}>Спосіб харчування:</Text>
                {Object.entries(restrictions.eating_style).map(
                  ([key, val]: any) => (
                    <Text key={key} style={styles.textSmall}>
                      • {translateKey(key)}: {val.suitable} — {val.explanation}
                    </Text>
                  )
                )}
              </>
            )}
          </View>
        )}

        <Pressable
          onPress={() => router.push("/")}
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.buttonText}>Повернутися на головну</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function translateKey(key: string): string {
  const map: Record<string, string> = {
    diabetes: "Діабет",
    pregnancy: "Вагітність",
    kidney_disease: "Захворювання нирок",
    children_under_3_years: "Діти до 3 років",
    hypertension: "Гіпертонія",
    gastritis: "Гастрит",
    ulcer: "Виразка",
    pancreatitis: "Панкреатит",
    gout: "Подагра",
    oncology: "Онкологія",
    obesity: "Ожиріння",
    anorexia: "Анорексія",
    islam: "Іслам",
    judaism: "Юдаїзм",
    hinduism: "Індуїзм",
    vegans: "Вегани",
    vegetarians: "Вегетаріанці",
    raw_foodists: "Сироїди",
  };
  return map[key] || key;
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: { fontSize: 22, color: "#2a5a43" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#2a5a43" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2a5a43",
    marginBottom: 10,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2a5a43",
    marginBottom: 8,
  },
  ingredientBox: { marginBottom: 10 },
  ingredientName: { fontWeight: "700", fontSize: 16, color: "#333" },
  text: { fontSize: 15, color: "#444", lineHeight: 20 },
  textSmall: { fontSize: 14, color: "#555", marginBottom: 4 },
  subsection: { marginTop: 8, fontWeight: "700", color: "#2a5a43" },
  button: {
    backgroundColor: "#2a5a43",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbe9e7",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
});
