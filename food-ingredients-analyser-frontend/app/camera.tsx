import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      await ImagePicker.getCameraPermissionsAsync();
      await ImagePicker.getMediaLibraryPermissionsAsync();
    })();
  }, []);

  const addImage = (uri: string) => {
    if (images.length >= 4) {
      Alert.alert("Ліміт", "Можна додати максимум 4 фото");
      return;
    }
    setImages((prev) => [...prev, uri]);
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Доступ заблоковано", "Надайте доступ до камери");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        addImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Помилка", "Не вдалося відкрити камеру");
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Доступ заблоковано", "Надайте доступ до галереї");
        return;
      }

      const freeSlots = 4 - images.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: freeSlots,
        orderedSelection: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((a) => a.uri);
        const newImages = [...images, ...uris].slice(0, 4);

        if (images.length + uris.length > 4) {
          Alert.alert("Ліміт", `Додано ${newImages.length - images.length} фото, максимум 4`);
        }

        setImages(newImages);
      }
    } catch {
      Alert.alert("Помилка", "Не вдалося відкрити галерею");
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  const sendToServer = async () => {
    if (images.length === 0) {
      Alert.alert("Помилка", "Додайте хоча б одне фото");
      return;
    }

    try {
      setLoading(true);
      router.push({ pathname: "/preferences", params: { images: JSON.stringify(images) } });
    } catch {
      Alert.alert("Помилка", "Щось пішло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Розпізнавання</Text>
          <Text style={styles.subtitle}>Сфотографуйте склад продукту</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}>
        <Text style={styles.infoText}>
          Додайте від 1 до 4 фото: склад продукту (зробіть кілька фото за необхідністю, щоб всі інгредієнти були присутні), назву (не обов'язково)
        </Text>

        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((uri) => (
              <Pressable key={uri} style={styles.imageWrapper} onPress={() => setPreviewUri(uri)}>
                <Image source={{ uri }} style={styles.image} />
                <Pressable style={styles.removeButton} onPress={() => removeImage(uri)}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <Pressable onPress={launchCamera} style={({ pressed }) => [styles.button, styles.cameraButton, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>📷 Камера</Text>
          </Pressable>
          <Pressable onPress={openGallery} style={({ pressed }) => [styles.button, styles.galleryButton, pressed && styles.pressed]}>
            <Text style={styles.galleryText}>🖼 Галерея</Text>
          </Pressable>
        </View>

        <Pressable onPress={sendToServer} disabled={loading} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Далі</Text>}
        </Pressable>
      </ScrollView>

      <View style={[styles.tip, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.tipText}>💡 Фото має бути чітким, а текст добре видно</Text>
      </View>

      {/* ПЕРЕГЛЯД ФОТО */}
      <Modal visible={!!previewUri} transparent animationType="fade">
        <Pressable style={styles.previewOverlay} onPress={() => setPreviewUri(null)}>
          <Image
            source={{ uri: previewUri ?? "" }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <Text style={styles.previewHint}>Натисніть будь-де щоб закрити</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    padding: 20,
  },
  infoText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  imageWrapper: {
    width: (width - 60) / 2,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cameraButton: {
    backgroundColor: "#ec7d39",
  },
  galleryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  galleryText: {
    color: "#000",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#2a5a43",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  tip: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    alignItems: "center",
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    backgroundColor: "#fff7f4",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    overflow: "hidden",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "85%",
  },
  previewHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 16,
  },
});