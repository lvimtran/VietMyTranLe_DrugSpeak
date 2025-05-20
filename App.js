import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Provider, useSelector } from "react-redux";
import { store } from "./src/redux/store";

import Category from "./src/screens/Category";
import DrugList from "./src/screens/DrugList";
import DrugDetail from "./src/screens/DrugDetail";
import LearningList from "./src/screens/LearningList";
import Learning from "./src/screens/Learning";
import SplashScreen from "./src/screens/SplashScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DrugStack() {
  return (
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
  );
}

function LearningStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LearningList"
        component={LearningList}
        options={{ title: "Learning List" }}
      />
      <Stack.Screen
        name="Learning"
        component={Learning}
        options={({ route }) => ({ title: route.params.drug.name })}
      />
    </Stack.Navigator>
  );
}

function MyTab() {
  const currentLearningCount = useSelector(
    (state) => state.learning.currentLearning.length
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Drugs") {
            iconName = focused ? "medkit" : "medkit-outline";
          } else if (route.name === "Learning") {
            iconName = focused ? "school" : "school-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Drugs"
        component={DrugStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningStack}
        options={{
          headerShown: false,
          tabBarBadge: currentLearningCount > 0 ? currentLearningCount : null,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Main" component={MyTab} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
