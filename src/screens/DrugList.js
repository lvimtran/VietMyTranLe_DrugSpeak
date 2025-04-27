import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { drugData } from "../../resources/resource";

export default function DrugList({ route, navigation }) {
  const { categoryId } = route.params;
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    setDrugs(drugData.filter((d) => d.categories.includes(categoryId)));
  }, [categoryId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("DrugDetail", { drug: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

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
    padding: 30,
    backgroundColor: "#eeeeee",
  },

  item: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 10,
  },

  name: {
    fontSize: 16,
  },
});
