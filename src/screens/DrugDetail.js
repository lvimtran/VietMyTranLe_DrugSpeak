import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import { drugCategory } from "../../resources/resource";

export default function DrugDetailScreen({ route }) {
  const { drug } = route.params;

  const [speeds, setSpeeds] = useState(
    drug.sounds.reduce((acc, { gender }) => {
      acc[gender] = "1.0";
      return acc;
    }, {})
  );

  const categoryNames = drug.categories
    .map((id) => drugCategory[id].name)
    .join(", ");

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
            <TouchableOpacity>
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
      <TouchableOpacity style={styles.studyButton}>
        <Text style={styles.studyButtonText}>STUDY</Text>
      </TouchableOpacity>
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
