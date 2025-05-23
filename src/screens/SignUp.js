import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import Icon from "react-native-vector-icons/Ionicons";
import AuthAPI from "../services/authApi";
import { showErrorAlert, validateUserData } from "../utils/errorHandler";

export default function SignUp({ navigation }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setName("");
    setGender("Female");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = async () => {
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      gender: gender,
    };

    const validation = validateUserData(userData);
    if (!validation.isValid) {
      showErrorAlert(validation.errors.join("\n"), "Validation Error");
      return;
    }

    setLoading(true);

    const response = await AuthAPI.signUp(userData);

    const user = {
      id: response.user?.id || Date.now().toString(),
      name: response.user?.name || name,
      email: response.user?.email || email,
      gender: response.user?.gender || gender,
      token: response.token,
    };

    dispatch(login(user));

    handleClear();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>A New User</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={20}
                color="#87CEEB"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#B0C4DE"
                editable={!loading}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Female" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("Female")}
                disabled={loading}
              >
                <Icon
                  name="female-outline"
                  size={16}
                  color={gender === "Female" ? "#FFFFFF" : "#87CEEB"}
                  style={styles.genderIcon}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "Female" && styles.genderButtonTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Male" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("Male")}
                disabled={loading}
              >
                <Icon
                  name="male-outline"
                  size={16}
                  color={gender === "Male" ? "#FFFFFF" : "#87CEEB"}
                  style={styles.genderIcon}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "Male" && styles.genderButtonTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
                editable={!loading}
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
                editable={!loading}
                autoCorrect={false}
                maxLength={100}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton]}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
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
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
            disabled={loading}
          >
            <Text style={[styles.switchLink, loading && { opacity: 0.5 }]}>
              Sign In
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
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#F8FCFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6F3FF",
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#87CEEB",
    borderColor: "#87CEEB",
  },
  genderIcon: {
    marginRight: 6,
  },
  genderButtonText: {
    color: "#4682B4",
    fontSize: 14,
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  signUpButton: {
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
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
