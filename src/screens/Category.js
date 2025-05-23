import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { drugData, drugCategory } from "../../resources/resource";

export default function Category({ navigation }) {
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
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("DrugList", {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
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
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F0F8FF",
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    color: "#4682B4",
    paddingVertical: 20,
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
});
