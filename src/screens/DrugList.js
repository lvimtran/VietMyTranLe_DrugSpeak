import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { drugData } from "../../resources/resource";
import { useSelector } from "react-redux";

export default function DrugList({ route, navigation }) {
  const { categoryId } = route.params;
  const [drugs, setDrugs] = useState([]);

  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finishedLearning = useSelector((state) => state.learning.finished);

  const allLearningDrugs = [...currentLearning, ...finishedLearning];

  useEffect(() => {
    setDrugs(drugData.filter((d) => d.categories.includes(categoryId)));
  }, [categoryId]);

  const renderItem = ({ item }) => {
    const isInLearningList = allLearningDrugs.some(
      (drug) => drug.id === item.id
    );

    return (
      <TouchableOpacity
        style={[styles.item, isInLearningList && styles.learningItem]}
        onPress={() => navigation.navigate("DrugDetail", { drug: item })}
      >
        <Text style={[styles.name, isInLearningList && styles.learningText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={drugs}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F0F8FF",
  },

  item: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 12,
    borderRadius: 16,
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E6F3FF",
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F4F4F",
  },

  learningItem: {
    backgroundColor: "#E6F3FF",
    borderColor: "#87CEEB",
  },

  learningText: {
    color: "#4682B4",
  },
});
