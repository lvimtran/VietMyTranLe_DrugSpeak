import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import { drugCategory } from "../../resources/resource";

export default function LearningList({ navigation }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("current");

  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finished = useSelector((state) => state.learning.finished);

  const currentData = activeTab === "current" ? currentLearning : finished;
  const isCurrentTab = activeTab === "current";
  const isFinishedTab = activeTab === "finished";

  const getCategoryNames = (categories) => {
    return categories
      .map((id) => drugCategory[id]?.name || "Unknown")
      .join(", ");
  };

  const handleDrugPress = (drug) => {
    navigation.navigate("LearningDetail", {
      drug,
      isFinished: isFinishedTab,
    });
  };

  const renderDrugItem = ({ item }) => (
    <TouchableOpacity
      style={styles.drugCard}
      onPress={() => handleDrugPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.drugHeader}>
        <View style={styles.drugTitleContainer}>
          <Text style={styles.drugName}>{item.name}</Text>
        </View>
      </View>

      <Text style={styles.drugFormula}>({item.molecular_formula})</Text>

      <Text style={styles.drugCategories}>
        Categories: {getCategoryNames(item.categories)}
      </Text>

      <Text style={styles.drugDescription} numberOfLines={2}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name={isCurrentTab ? "school-outline" : "checkmark-circle-outline"}
        size={64}
        color="#dee2e6"
      />
      <Text style={styles.emptyTitle}>
        {isCurrentTab ? "No drugs in learning" : "No completed drugs"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isCurrentTab
          ? "Add drugs from the Drugs tab to start learning"
          : "Complete learning drugs to see them here"}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, isCurrentTab && styles.activeTab]}
          onPress={() => setActiveTab("current")}
        >
          <Icon
            name="school"
            size={18}
            color={isCurrentTab ? "#FFFFFF" : "#6c757d"}
          />
          <Text style={[styles.tabText, isCurrentTab && styles.activeTabText]}>
            Current ({currentLearning.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, isFinishedTab && styles.activeTab]}
          onPress={() => setActiveTab("finished")}
        >
          <Icon
            name="checkmark-circle"
            size={18}
            color={isFinishedTab ? "#FFFFFF" : "#6c757d"}
          />
          <Text style={[styles.tabText, isFinishedTab && styles.activeTabText]}>
            Finished ({finished.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <FlatList
        data={currentData}
        keyExtractor={(item) => `${item.id}-${activeTab}`}
        renderItem={renderDrugItem}
        contentContainerStyle={[
          styles.listContainer,
          currentData.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#007bff",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  drugCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  drugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  drugTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drugName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    flex: 1,
  },
  drugFormula: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6c757d",
    marginBottom: 8,
  },
  drugCategories: {
    fontSize: 13,
    color: "#007bff",
    marginBottom: 8,
    fontWeight: "500",
  },
  drugDescription: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
    lineHeight: 20,
  },
});
