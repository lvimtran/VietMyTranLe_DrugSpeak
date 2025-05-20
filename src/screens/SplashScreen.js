import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Main");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={StyleSheet.container}>
      <Image
        source={require("../../assets/drug-speak.jpeg")}
        style={styles.img}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "auto",
    height: "100%",
  },
});
