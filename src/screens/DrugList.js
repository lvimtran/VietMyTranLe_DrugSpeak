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
    <TouchableOpacity style={styles.item}>
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  name: { fontSize: 16 },
});
