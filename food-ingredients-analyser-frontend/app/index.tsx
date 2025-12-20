import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = async () => {
    try {
      router.push("/camera");
    } catch {
      Alert.alert("Помилка", "Не вдалося відкрити наступний екран.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fbe9e7" />
      
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="cover"
            accessibilityLabel="Логотип застосунку"
          />
        </View>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.title}>Food Ingredients Analyser</Text>
        <Text style={styles.subtitle}>
          Скануй. Дізнавайся. Їж усвідомлено 😎
        </Text>

        <Image
          source={require("../assets/images/label-jar.gif")}
          style={styles.lableHomeScreen}
          resizeMode="cover"
          accessibilityLabel="Зображення продуктів"
        />

        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Почати роботу</Text>
        </Pressable>

        <Text style={styles.hint}>
          Натисни, щоб перейти до розпізнавання складу продукту
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbe9e7",
  },
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ec7d39",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#496e55",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "500",
  },
  lableHomeScreen: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: "#2a5a43",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2a5a43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: "80%",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
    color: "#587b64",
    textAlign: "center",
    opacity: 0.85,
  },
});