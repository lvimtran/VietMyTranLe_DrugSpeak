import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { drugCategory } from "../../resources/resource";
import { finishLearning, removeDrug } from "../redux/learningSlice";
import { Audio } from "expo-av";

const soundFiles = {
  "Ibuprofen - female.wav": require("../../resources/Ibuprofen - female.wav"),
  "Ibuprofen 1 - male.wav": require("../../resources/Ibuprofen 1 - male.wav"),
  "Celecoxib - female.wav": require("../../resources/Celecoxib - female.wav"),
  "Celecoxib 1 - male.wav": require("../../resources/Celecoxib 1 - male.wav"),
  "Chloramphenicol - female.wav": require("../../resources/Chloramphenicol - female.wav"),
  "Chloramphenicol 1 - male.wav": require("../../resources/Chloramphenicol 1 - male.wav"),
  "Diphenoxylate - female.wav": require("../../resources/Diphenoxylate - female.wav"),
  "Diphenoxylate 1 - male.wav": require("../../resources/Diphenoxylate 1 - male.wav"),
  "Famciclovir - female.wav": require("../../resources/Famciclovir - female.wav"),
  "Famciclovir 1 - male.wav": require("../../resources/Famciclovir 1 - male.wav"),
  "Fluconazole - female.wav": require("../../resources/Fluconazole - female.wav"),
  "Fluconazole 1 - male.wav": require("../../resources/Fluconazole 1 - male.wav"),
  "Glyceryl trinitrate - female.wav": require("../../resources/Glyceryl trinitrate - female.wav"),
  "Glyceryl trinitrate 1 - male.wav": require("../../resources/Glyceryl trinitrate 1 - male.wav"),
  "Hydrocortisone - female.wav": require("../../resources/Hydrocortisone - female.wav"),
  "Hydrocortisone 1 - male.wav": require("../../resources/Hydrocortisone 1 - male.wav"),
  "Levonorgestrel - female.wav": require("../../resources/Levonorgestrel - female.wav"),
  "Levonorgestrel 1 - male.wav": require("../../resources/Levonorgestrel 1 - male.wav"),
  "Melatonin - female.wav": require("../../resources/Melatonin - female.wav"),
  "Melatonin 1 - male.wav": require("../../resources/Melatonin 1 - male.wav"),
  "Naloxone - female.wav": require("../../resources/Naloxone - female.wav"),
  "Naloxone 1 - male.wav": require("../../resources/Naloxone 1 - male.wav"),
  "Pantoprazole - female.wav": require("../../resources/Pantoprazole - female.wav"),
  "Pantoprazole 1 - male.wav": require("../../resources/Pantoprazole 1 - male.wav"),
  "Paracetamol - female.wav": require("../../resources/Paracetamol - female.wav"),
  "Paracetamol 1 - male.wav": require("../../resources/Paracetamol 1 - male.wav"),
  "Promethazine - female.wav": require("../../resources/Promethazine - female.wav"),
  "Promethazine 1 - male.wav": require("../../resources/Promethazine 1 - male.wav"),
  "Pseudoephedrine - female.wav": require("../../resources/Pseudoephedrine - female.wav"),
  "Pseudoephedrine 1 - male.wav": require("../../resources/Pseudoephedrine 1 - male.wav"),
  "Salbutamol - female.wav": require("../../resources/Salbutamol - female.wav"),
  "Salbutamol 1 - male.wav": require("../../resources/Salbutamol 1 - male.wav"),
  "Sumatriptan - female.wav": require("../../resources/Sumatriptan - female.wav"),
  "Sumatriptan 1 - male.wav": require("../../resources/Sumatriptan 1 - male.wav"),
  "Terbutaline - female.wav": require("../../resources/Terbutaline - female.wav"),
  "Terbutaline 1 - male.wav": require("../../resources/Terbutaline 1 - male.wav"),
  "Triamcinolone - female.wav": require("../../resources/Triamcinolone - female.wav"),
  "Triamcinolone 1 - male.wav": require("../../resources/Triamcinolone 1 - male.wav"),
  "Ulipristal - female.wav": require("../../resources/Ulipristal - female.wav"),
  "Ulipristal 1 - male.wav": require("../../resources/Ulipristal 1 - male.wav"),
  "Dihydrocodeine - female.wav": require("../../resources/Dihydrocodeine - female.wav"),
  "Doxylamine - female.wav": require("../../resources/Doxylamine - female.wav"),
  "Metoclopramide - female.wav": require("../../resources/Metoclopramide - female.wav"),
  "Prochlorperazine - female.wav": require("../../resources/Prochlorperazine - female.wav"),
};

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function Learning({ route, navigation }) {
  const { drug } = route.params;
  const dispatch = useDispatch();
  const [sound, setSound] = useState();
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [drugScore, setDrugScore] = useState(drug.score || 0);

  const [speed, setSpeed] = useState(
    drug.sounds.reduce((acc, { gender }) => {
      acc[gender] = "1.0";
      return acc;
    }, {})
  );

  const categoryNames = drug.categories
    .map((id) => drugCategory[id].name)
    .join(", ");

  async function playSound(file, speed) {
    console.log("Loading Sound", file);

    const { sound: newSound } = await Audio.Sound.createAsync(
      soundFiles[file],
      {
        volume: 1.0,
        rate: parseFloat(speed),
        shouldPlay: true,
      }
    );

    setSound(newSound);
  }

  async function playRecording(uri) {
    console.log("Playing recording:", uri);

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
    } catch (error) {
      console.error("Error playing recording:", error);
      Alert.alert("Error", "Failed to play recording");
    }
  }

  async function startRecording() {
    console.log("Requesting permissions...");
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Permission to access microphone is required!");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    console.log("Starting recording...");
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(recording);
    setIsRecording(true);
    console.log("Recording started");
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const timestamp = formatDate(new Date());

    setRecordings((prev) => [
      ...prev,
      {
        uri,
        timestamp,
        score: "",
      },
    ]);

    setRecording(null);
    console.log("Recording stopped and stored at:", uri);
  }

  function deleteRecording(indexToDelete) {
    setRecordings((prev) => prev.filter((_, index) => index !== indexToDelete));
  }

  const evaluateRecording = async (index) => {
    if (index < 0 || index >= recordings.length) return;

    setIsEvaluating(true);

    const score = Math.floor(Math.random() * 101);

    setRecordings((prev) => {
      const updatedRecordings = [...prev];
      updatedRecordings[index] = {
        ...updatedRecordings[index],
        score,
      };

      const highestScore = Math.max(
        ...updatedRecordings.map((rec) => rec.score || 0)
      );

      if (highestScore > drugScore) {
        setDrugScore(highestScore);
      }

      return updatedRecordings;
    });

    setIsEvaluating(false);
  };

  useEffect(() => {
    const setupAudio = async () => {
      console.log("Setting up audio...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    };

    setupAudio();

    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission",
          "Permission to access microphone is required!"
        );
      }
    })();

    return () => {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
      if (recording) {
        console.log("Unloading recording");
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.title}>
          {drug.name} ({drugScore})
        </Text>
        <Text style={styles.formula}>({drug.molecular_formula})</Text>
        <Text style={styles.categories}>Categories: {categoryNames}</Text>
        <Text style={styles.desc}>{drug.desc}</Text>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollArea}>
          <View style={styles.pronunciationSection}>
            {drug.sounds.map(({ gender, file }) => (
              <View key={file} style={styles.card}>
                <View style={styles.cardLeft}>
                  <TouchableOpacity
                    onPress={() => playSound(file, speed[gender])}
                  >
                    <Icon name="volume-high-outline" size={20} />
                  </TouchableOpacity>
                  <Text style={styles.soundLabel}>{drug.name}</Text>
                  <Icon
                    name={gender === "male" ? "male-outline" : "female-outline"}
                    size={18}
                    style={[
                      styles.genderIcon,
                      gender === "male" ? styles.male : styles.female,
                    ]}
                  />
                </View>

                <View style={styles.pickerContainer}>
                  <Picker
                    mode={Platform.OS === "android" ? "dropdown" : "dialog"}
                    selectedValue={speed[gender]}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(val) =>
                      setSpeed((prev) => ({ ...prev, [gender]: val }))
                    }
                    prompt="Speed"
                  >
                    {["0.5", "1.0", "1.5", "2.0"].map((v) => (
                      <Picker.Item key={v} label={`${v}×`} value={v} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}
          </View>

          {recordings.length > 0 && (
            <View style={styles.recordingsList}>
              <Text style={styles.recordingsTitle}>Your Recordings</Text>
              {recordings.map((item, index) => (
                <View key={index} style={styles.recordingItem}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playRecording(item.uri)}
                  >
                    <Icon
                      name="play-circle-outline"
                      size={24}
                      color="#007bff"
                    />
                  </TouchableOpacity>

                  <View style={styles.recordingInfo}>
                    <Text style={styles.timestampText}>
                      {item.timestamp} (
                      {item.score !== undefined ? item.score : 0})
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteRecording(index)}
                  >
                    <Icon name="trash-outline" size={20} color="#dc3545" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => evaluateRecording(index)}
                    disabled={isEvaluating}
                  >
                    <Icon
                      name="document-text-outline"
                      size={20}
                      color={isEvaluating ? "#cccccc" : "#007bff"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      <View style={styles.footerSection}>
        <View style={styles.recordSection}>
          <Pressable
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Text style={styles.recordText}>
              {isRecording ? "Recording..." : "Hold to Record"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.finishButton]}>
            <Text style={styles.actionButtonText}>Finish</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.removeButton]}>
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  infoSection: {
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  formula: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 6,
  },
  categories: {
    fontSize: 13,
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 14,
  },
  pronunciationSection: {
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    minHeight: 48,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  soundLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 6,
  },
  genderIcon: {
    marginLeft: 4,
  },
  female: {
    color: "deeppink",
  },
  male: {
    color: "dodgerblue",
  },
  pickerContainer: {
    width: Platform.OS === "android" ? 60 : 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    height: Platform.OS === "android" ? 32 : 40,
  },
  picker: {
    width: "100%",
    height: Platform.OS === "android" ? 32 : 40,
  },
  pickerItem: {
    height: 40,
    fontSize: 15,
    textAlign: "center",
  },
  recordSection: {
    alignItems: "center",
    marginVertical: 15,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  finishButton: {
    backgroundColor: "#28a745",
  },
  removeButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recordingActive: {
    backgroundColor: "#ff6347",
    transform: [{ scale: 1.05 }],
  },
  recordingsList: {
    marginBottom: 15,
  },
  recordingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  playButton: {
    marginRight: 10,
  },
  recordingInfo: {
    flex: 1,
  },
  timestampText: {
    fontSize: 14,
    color: "#333",
  },
  deleteButton: {
    padding: 5,
  },
  actionIcon: {
    padding: 5,
    marginLeft: 5,
  },
  bottomPadding: {
    height: 20,
  },
});
