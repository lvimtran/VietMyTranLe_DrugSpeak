import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Category from "./src/screens/Category";
import DrugList from "./src/screens/DrugList";
import DrugDetail from "./src/screens/DrugDetail";

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
        <Stack.Screen
          name="DrugList"
          component={DrugList}
          options={({ route }) => ({ title: route.params.categoryName })}
        />
        <Stack.Screen
          name="DrugDetail"
          component={DrugDetail}
          options={({ route }) => ({ title: route.params.drug.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
