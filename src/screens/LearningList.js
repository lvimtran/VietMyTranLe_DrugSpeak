import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";

export default function LearningList({ navigation }) {
  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finishedLearning = useSelector((state) => state.learning.finished);

  const [currentExpand, setCurrentExpand] = useState(false);
  const [finishedExpand, setFinishedExpand] = useState(false);

  const toggleCurrentExpand = () => setCurrentExpand(!currentExpand);
  const toggleFinishedExpand = () => setFinishedExpand(!finishedExpand);

  const renderCurrentHeader = () => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={toggleCurrentExpand}
    >
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Current Learning</Text>
        <Text style={styles.sectionCount}>({currentLearning.length})</Text>
      </View>
      <Icon
        name={currentExpand ? "remove-circle-outline" : "add-circle-outline"}
        size={24}
        color="#007bff"
      />
    </TouchableOpacity>
  );

  const renderFinishedHeader = () => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={toggleFinishedExpand}
    >
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Finished</Text>
        <Text style={styles.sectionCount}>({finishedLearning.length})</Text>
      </View>
      <Icon
        name={finishedExpand ? "remove-circle-outline" : "add-circle-outline"}
        size={24}
        color="#007bff"
      />
    </TouchableOpacity>
  );

  const renderDrugItem = ({ item, section }) => (
    <TouchableOpacity
      style={styles.drugItem}
      onPress={() => {
        if (section === "current") {
          navigation.navigate("Learning", { drug: item });
        }
      }}
    >
      <Text style={styles.drugName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Current Learning Section */}
      <View style={styles.section}>
        {renderCurrentHeader()}

        {currentExpand && (
          <FlatList
            data={currentLearning}
            keyExtractor={(item) => item.id}
            renderItem={(itemData) =>
              renderDrugItem({ ...itemData, section: "current" })
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No content</Text>
            }
          />
        )}
      </View>

      {/* Finished Section */}
      <View style={styles.section}>
        {renderFinishedHeader()}

        {finishedExpand && (
          <FlatList
            data={finishedLearning}
            keyExtractor={(item) => item.id}
            renderItem={(itemData) =>
              renderDrugItem({ ...itemData, section: "finished" })
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No content</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionCount: {
    fontSize: 16,
    color: "#777",
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  drugItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  drugName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#999",
    fontStyle: "italic",
  },
});
