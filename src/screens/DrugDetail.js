import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { drugCategory } from "../../resources/resource.js";
import { useDispatch, useSelector } from "react-redux";
import { addToLearningList } from "../redux/learningSlice";
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

export default function DrugDetailScreen({ route }) {
  const { drug } = route.params;
  const dispatch = useDispatch();
  const [sound, setSound] = useState();

  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finishedLearning = useSelector((state) => state.learning.finished);
  const isInLearningList =
    currentLearning.some((item) => item.id === drug.id) ||
    finishedLearning.some((item) => item.id === drug.id);

  const handleAddToLearningList = () => {
    dispatch(addToLearningList(drug));
  };

  const [speeds, setSpeeds] = useState(
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

  useEffect(() => {
    const setupAudio = async () => {
      console.log("Setting up audio...");
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    };

    setupAudio();

    return () => {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{drug.name}</Text>
      <Text style={styles.formula}>({drug.molecular_formula})</Text>
      <Text style={styles.categories}>Categories: {categoryNames}</Text>
      <Text style={styles.desc}>{drug.desc}</Text>

      {/* Pronunciation cards */}
      {drug.sounds.map(({ gender, file }) => (
        <View key={file} style={styles.card}>
          <View style={styles.cardLeft}>
            <TouchableOpacity onPress={() => playSound(file, speeds[gender])}>
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
              selectedValue={speeds[gender]}
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

      {/* STUDY button */}
      {!isInLearningList && (
        <TouchableOpacity
          style={styles.studyButton}
          onPress={handleAddToLearningList}
        >
          <Text style={styles.studyButtonText}>STUDY</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
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

  studyButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  studyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
