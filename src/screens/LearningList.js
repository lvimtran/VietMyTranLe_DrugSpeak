import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

export default function LearningList() {
  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finishedLearning = useSelector((state) => state.learning.finished);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Current Learning: {currentLearning.length} drugs
      </Text>
      <Text style={styles.subtitle}>
        Finished: {finishedLearning.length} drugs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
});
