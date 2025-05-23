import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/authSlice";
import Icon from "react-native-vector-icons/Ionicons";
import AuthAPI from "../services/authApi";
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirmationAlert,
  validateName,
} from "../utils/errorHandler";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const currentLearningCount = useSelector((state) => {
    try {
      return state.learning?.currentLearning?.length || 0;
    } catch {
      return 0;
    }
  });

  const finishedLearningCount = 0;
  const totalScore = 0;

  const handleSignOut = () => {
    dispatch(logout());
  };

  const handleUpdate = () => {
    setNewName(user?.name || "");
    setNewPassword("");
    setIsEditing(true);
  };

  const handleConfirm = async () => {
    if (!user?.token) {
      dispatch(logout());
    }

    if (!newName.trim()) {
      showErrorAlert("Name cannot be empty", "Information Missing");
      return;
    }

    if (!validateName(newName.trim())) {
      showErrorAlert(
        "Name must be at least 2 characters and contain only letters",
        "False Information"
      );
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: newName.trim(),
      };

      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          showErrorAlert(
            "Password must be at least 6 characters long",
            "Error"
          );
          setLoading(false);
          return;
        }
        updateData.password = newPassword;
      }

      console.log("📤 Sending update data:", updateData);

      // Call server API to update profile
      const response = await AuthAPI.updateProfile(user.token, updateData);

      console.log("✅ Profile update response:", response);

      const updatedUser = {
        ...user,
        ...response.user,
        name: response.user.username || response.user.name,
      };

      console.log("🔄 Updating Redux with:", updatedUser);
      dispatch(login(updatedUser));
      setIsEditing(false);
      setNewPassword("");

      showSuccessAlert(
        response.message || "Profile updated successfully!",
        "Success"
      );
    } catch (error) {
      console.error("❌ Profile update error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      // Handle specific error cases
      if (error.message.includes("Unauthorized")) {
        console.log("🔓 Token expired during update, logging out...");
        dispatch(logout());
        showErrorAlert(
          "Your session has expired. Please login again.",
          "Session Expired"
        );
      } else if (error.message.includes("timeout")) {
        showErrorAlert(
          "Request timed out. Please check your connection and try again.",
          "Timeout Error"
        );
      } else {
        showErrorAlert(
          error.message || "Failed to update profile",
          "Update Failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName(user?.name || "");
    setNewPassword("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Update Profile</Text>
            <Text style={styles.subtitle}>Edit Your Information</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>User Name</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="person-outline"
                  size={20}
                  color="#87CEEB"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Enter your name"
                  placeholderTextColor="#B0C4DE"
                  editable={!loading}
                  maxLength={50}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color="#87CEEB"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password (leave empty to keep current)"
                  placeholderTextColor="#B0C4DE"
                  secureTextEntry
                  editable={!loading}
                  maxLength={100}
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <View style={styles.loadingContainer}>
                <Icon name="checkmark" size={20} color="#FFFFFF" />
                <Text style={[styles.confirmButtonText, { marginLeft: 8 }]}>
                  Confirm
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>User Profile</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || "User"}!</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.sectionContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="person-outline" size={20} color="#87CEEB" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User Name</Text>
                <Text style={styles.infoValue}>{user?.name || "Not set"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="mail-outline" size={20} color="#87CEEB" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "Not set"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon
                  name={
                    user?.gender === "female"
                      ? "female-outline"
                      : "male-outline"
                  }
                  size={20}
                  color="#87CEEB"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "Not set"}
                </Text>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="school-outline" size={20} color="#87CEEB" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Current Learning</Text>
                  <Text style={styles.infoValue}>
                    {currentLearningCount} drugs
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon
                    name="checkmark-circle-outline"
                    size={20}
                    color="#87CEEB"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Finished</Text>
                  <Text style={styles.infoValue}>
                    {finishedLearningCount} drugs
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="trophy-outline" size={20} color="#87CEEB" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Total Score</Text>
                  <Text style={styles.infoValue}>{totalScore}</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  profileLoading && styles.buttonDisabled,
                ]}
                onPress={handleUpdate}
                disabled={profileLoading}
              >
                <Icon name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.signOutButton,
                  profileLoading && styles.buttonDisabled,
                ]}
                onPress={handleSignOut}
                disabled={profileLoading}
              >
                <Icon name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#708090",
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
  sectionContainer: {
    marginBottom: 20,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E6F3FF",
  },
  infoIconContainer: {
    width: 40,
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4682B4",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#2F4F4F",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  updateButton: {
    backgroundColor: "#87CEEB",
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  signOutButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confirmButton: {
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
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#B0C4DE",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  debugContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
  },
});
