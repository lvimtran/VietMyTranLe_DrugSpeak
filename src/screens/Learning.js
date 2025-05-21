import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
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

export default function Learning({ route, navigation }) {
  const { drug } = route.params;
  const dispatch = useDispatch();
  const [sound, setSound] = useState();

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

    console.log("Loading sound using createAsync");
    const { sound: newSound } = await Audio.Sound.createAsync(
      soundFiles[file],
      {
        volume: 1.0,
        rate: parseFloat(speed),
        shouldPlay: true,
      }
    );

    console.log("Sound loaded successfully, playing...");
    setSound(newSound);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        console.log("Sound finished playing");
      }
    });
  }

  useEffect(() => {
    const setupAudio = async () => {
      console.log("Setting up audio...");
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    };

    setupAudio();

    // Cleanup function
    return () => {
      if (sound) {
        console.log("Unloading Sound on component unmount");
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Drug Information Section (same as in DrugDetail) */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>{drug.name}</Text>
        <Text style={styles.formula}>({drug.molecular_formula})</Text>
        <Text style={styles.categories}>Categories: {categoryNames}</Text>
        <Text style={styles.desc}>{drug.desc}</Text>

        {/* Pronunciation cards */}
        {drug.sounds.map(({ gender, file }) => (
          <View key={file} style={styles.card}>
            <View style={styles.cardLeft}>
              <TouchableOpacity onPress={() => playSound(file, speed[gender])}>
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
                  setSpeeds((prev) => ({ ...prev, [gender]: val }))
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

      {/* Hold to Record Button */}
      <View style={styles.recordSection}>
        <Pressable style={styles.recordButton}>
          <Text style={styles.recordText}>Hold to Record</Text>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.finishButton]}>
          <Text style={styles.actionButtonText}>Finish</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.removeButton]}>
          <Text style={styles.actionButtonText}>Remove</Text>
        </TouchableOpacity>
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
    marginVertical: 20,
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
    marginTop: 20,
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
});
