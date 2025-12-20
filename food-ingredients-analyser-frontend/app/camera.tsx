import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await ImagePicker.getCameraPermissionsAsync();
        await ImagePicker.getMediaLibraryPermissionsAsync();
      } catch (error) {
        console.error("Помилка при перевірці дозволів:", error);
      }
    })();
  }, []);

  const launchCamera = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Доступ заблоковано",
          "Надай дозвіл для використання камери у налаштуваннях пристрою."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageSize({ width: asset.width, height: asset.height });
      }
    } catch {
      Alert.alert("Помилка", "Не вдалося відкрити камеру.");
    } finally {
      setLoading(false);
    }
  };

  const openGallery = async () => {
    try {
      setLoading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Доступ заблоковано",
          "Надай дозвіл для перегляду галереї у налаштуваннях пристрою."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageSize({ width: asset.width, height: asset.height });
      }
    } catch {
      Alert.alert("Помилка", "Не вдалося відкрити галерею.");
    } finally {
      setLoading(false);
    }
  };

 const sendToServer = async () => {
  if (!imageUri) {
    Alert.alert("Помилка", "Спочатку зроби або вибери фото.");
    return;
  }

  try {
    setLoading(true);
    router.push({
      pathname: "/preferences",
      params: { imageUri: imageUri }
    });
  } catch (error) {
    console.error("Помилка:", error);
    Alert.alert("Помилка", "Щось пішло не так.");
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Розпізнавання</Text>
          <Text style={styles.subtitle}>Додай фото продукту</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!imageUri ? (
          <>
            <View style={styles.placeholderBox}>
              <View style={styles.iconCircle}>
                <Text style={styles.cameraIcon}>📸</Text>
              </View>
              <Text style={styles.placeholderText}>
                Зроби фото етикетки або вибери з галереї
              </Text>
              <Text style={styles.placeholderHint}>
                Переконайся, що етикетка добре видима та освітлена
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={launchCamera}
                disabled={loading}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.cameraButton,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <View style={styles.buttonIconContainer}>
                      <Text style={styles.buttonIcon}>📷</Text>
                    </View>
                    <Text style={styles.buttonText}>Камера</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={openGallery}
                disabled={loading}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.galleryButton,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#2a5a43" size="small" />
                ) : (
                  <>
                    <View style={styles.buttonIconContainer}>
                      <Text style={styles.buttonIcon}>🖼️</Text>
                    </View>
                    <Text style={[styles.buttonText, styles.galleryButtonText]}>
                      Галерея
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.previewSection}>
            <View style={[
              styles.previewContainer,
              imageSize && {
                height: Math.min(500, (width - 40) * (imageSize.height / imageSize.width))
              }
            ]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View style={styles.previewOverlay}>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>Фото готове</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Pressable
                onPress={sendToServer}
                style={({ pressed }) => [
                  styles.primaryAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryActionText}>Проаналізувати</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setImageUri(null);
                  setImageSize(null);
                }}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryActionText}>Вибрати інше фото</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {!imageUri && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Для найкращого результату тримай камеру на відстані 15-20 см від
            етикетки. Роби фото при гарному освітленні
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbe9e7",
  },
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
  backIcon: {
    fontSize: 24,
    color: "#2a5a43",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  placeholder: {
    width: 44,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2a5a43",
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7571",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  placeholderBox: {
    height: 450,
    backgroundColor: "#fff",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e8e8e8",
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fbe9e7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cameraIcon: {
    fontSize: 40,
  },
  placeholderText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2a5a43",
    textAlign: "center",
    marginBottom: 8,
  },
  placeholderHint: {
    fontSize: 14,
    color: "#6E7571",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cameraButton: {
    backgroundColor: "#ec7d39",
  },
  galleryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#a6d4c3",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIconContainer: {
    marginBottom: 8,
  },
  buttonIcon: {
    fontSize: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  galleryButtonText: {
    color: "#2a5a43",
  },
  debugText: {
    fontSize: 10,
    color: "#f00",
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  previewSection: {
    width: "100%",
  },
  previewContainer: {
    width: "100%",
    height: 600,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  previewOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a5a43",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successIcon: {
    fontSize: 16,
    color: "#fff",
    marginRight: 6,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryAction: {
    backgroundColor: "#2a5a43",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2a5a43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryAction: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6E7571",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#6E7571",
    lineHeight: 18,
  },
});