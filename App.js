import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./src/redux/store";

import Category from "./src/screens/Category";
import DrugList from "./src/screens/DrugList";
import DrugDetail from "./src/screens/DrugDetail";
import LearningList from "./src/screens/LearningList";
import Learning from "./src/screens/Learning";
import SplashScreen from "./src/screens/SplashScreen";
import SignIn from "./src/screens/SignIn";
import SignUp from "./src/screens/SignUp";
import Profile from "./src/screens/Profile";
import Community from "./src/screens/Community";
import {
  loadUserFromStorage,
  selectIsLoggedIn,
  selectAuthLoading,
} from "./src/redux/authSlice";

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
        name="LearningDetail"
        component={Learning}
        options={({ route }) => ({ title: route.params.drug.name })}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="UserProfile" component={Profile} />
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
}

function MyTab() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const currentLearningCount = useSelector(
    (state) => state.learning.currentLearning.length
  );

  return (
    <Tab.Navigator
      initialRouteName={isLoggedIn ? "Drugs" : "Profile"}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Drugs") {
            iconName = focused ? "medkit" : "medkit-outline";
          } else if (route.name === "Learning") {
            iconName = focused ? "school" : "school-outline";
          } else if (route.name === "Community") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              Alert.alert("Access Denied", "Login first to access Learning.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Login",
                  onPress: () => navigation.navigate("Profile"),
                },
              ]);
            }
          },
        })}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              Alert.alert("Access Denied", "Login first to access Community.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Login",
                  onPress: () => navigation.navigate("Profile"),
                },
              ]);
            }
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          title: isLoggedIn ? "Profile" : "Sign In",
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const authLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
        console.log("✅ User loaded from storage successfully");
      } catch (error) {
        console.log("ℹ️ No saved user found or token expired");
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={MyTab} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
