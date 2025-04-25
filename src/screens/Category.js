import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { drugData, drugCategory } from "../../resources/resource";

export default function Category({}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const cates = Object.values(drugCategory).map((cate) => ({
      id: cate.id,
      name: cate.name,
      count: drugData.filter((d) => d.categories.includes(cate.id)).length,
    }));
    setCategories(cates);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <Text style={styles.name}>
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: "#eeeeee" },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    paddingVertical: 10,
  },
  item: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 10,
  },
  name: { fontSize: 16 },
});
