import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import Icon from "react-native-vector-icons/Ionicons";
import AuthAPI from "../services/authApi";
import { showErrorAlert } from "../utils/errorHandler";

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await AuthAPI.testConnection();
      setServerConnected(isConnected);
    };
    testConnection();
  }, []);

  const handleClear = () => {
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async () => {
    const credentials = {
      email: email.trim().toLowerCase(),
      password: password,
    };
    setLoading(true);

    try {
      console.log("🔐 Signing in...");
      const response = await AuthAPI.signIn(credentials);
      const token = response.token || response.access_token;

      if (!token) {
        console.error("❌ No token received from server:", response);
        throw new Error("Authentication failed - no token received");
      }

      console.log("✅ Token received:", token.substring(0, 20) + "...");

      const user = {
        id: response.user?.id || "1",
        name: response.user?.name || response.user?.username || "User",
        email: response.user?.email || email,
        gender: response.user?.gender || "Male",
        token: token,
      };

      console.log("🔄 Storing user in Redux:", {
        ...user,
        token: token.substring(0, 20) + "...",
      });

      // Store user in Redux
      dispatch(login(user));
    } catch (error) {
      console.error("❌ Login error:", error);
      if (
        error.message.includes("fetch") ||
        error.message.includes("Network")
      ) {
        showNetworkErrorAlert();
      } else {
        showErrorAlert(error.message || error, "Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>With Your Email And Password</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="mail-outline"
                size={20}
                color="#87CEEB"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#B0C4DE"
                autoCorrect={false}
                maxLength={100}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color="#87CEEB"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#B0C4DE"
                autoCorrect={false}
                maxLength={100}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.signInButton,
              (loading || !serverConnected) && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={loading || !serverConnected}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            disabled={loading}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            disabled={loading}
          >
            <Text style={[styles.switchLink, loading && { opacity: 0.5 }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4682B4",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#708090",
    fontWeight: "400",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4682B4",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FCFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6F3FF",
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: "#2F4F4F",
    paddingRight: 16,
  },
  signInButton: {
    backgroundColor: "#87CEEB",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  clearButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#B0C4DE",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.5,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  switchText: {
    fontSize: 14,
    color: "#708090",
  },
  switchLink: {
    fontSize: 14,
    color: "#4682B4",
    fontWeight: "600",
  },
});
