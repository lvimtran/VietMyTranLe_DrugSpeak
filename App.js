import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Category from "./src/screens/Category";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Categories">
        <Stack.Screen
          name="Categories"
          component={Category}
          options={{ title: "Drugs" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
