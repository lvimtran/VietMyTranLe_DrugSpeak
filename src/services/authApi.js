import { Platform } from "react-native";
import Constants from "expo-constants";

const YOUR_COMPUTER_IP = "192.168.18.30";

const getBaseUrl = () => {
  if (__DEV__) {
    return `http://${YOUR_COMPUTER_IP}:3000`;
  }
  return "https://your-production-server.com";
};

const API_BASE_URL = getBaseUrl();

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 Development mode: ${__DEV__}`);

class AuthAPI {
  static API_BASE_URL = API_BASE_URL;

  // Connection test for Expo
  static async testConnection() {
    const testUrls = [API_BASE_URL, `http://${YOUR_COMPUTER_IP}:3000`];

    console.log("🔍 Testing server connections for Expo...");

    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(`⏰ Timeout for ${url}`);
        }, 8000);

        const response = await fetch(`${url}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(
          `📡 Response from ${url}: Status ${response.status}, OK: ${response.ok}`
        );

        if (response.ok) {
          console.log(`✅ Connection successful: ${url}`);
          this.API_BASE_URL = url;
          return true;
        } else {
          console.log(
            `⚠️ Server responded but not OK: ${url} (Status: ${response.status})`
          );
        }
      } catch (error) {
        console.log(`❌ Failed: ${url} - ${error.message}`);
        if (error.name === "AbortError") {
          console.log(`⏰ Request timed out for ${url}`);
        }
      }
    }

    console.log("❌ All connection attempts failed");
    return false;
  }

  // Sign up new user
  static async signUp(userData) {
    try {
      console.log(`📝 Signing up user to: ${this.API_BASE_URL}/users`);

      const serverUserData = {
        username: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        gender: userData.gender.toLowerCase(),
      };

      console.log(`📝 Transformed user data:`, {
        ...serverUserData,
        password: "[HIDDEN]",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log("⏰ SignUp request timed out");
      }, 15000);

      const response = await fetch(`${this.API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(serverUserData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📝 SignUp response status: ${response.status}`);

      let data;
      try {
        data = await response.json();
        console.log(`📝 SignUp response data:`, data);
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.log(`❌ SignUp failed with status: ${response.status}`);

        if (response.status === 400) {
          if (Array.isArray(data.message)) {
            throw new Error(data.message.join(", "));
          } else if (typeof data.message === "string") {
            throw new Error(data.message);
          } else {
            throw new Error("Invalid registration data");
          }
        } else if (response.status === 409) {
          throw new Error(
            "Email already exists. Please use a different email."
          );
        } else if (response.status === 422) {
          throw new Error(data.message || "Validation failed");
        } else {
          throw new Error(data.message || "Registration failed");
        }
      }

      console.log("✅ SignUp successful");

      const transformedUser = {
        ...data,
        name: data.username || data.name,
      };

      const token = data.token || data.access_token;

      return {
        user: transformedUser,
        message: data.message || "Registration successful",
        token: token,
      };
    } catch (error) {
      console.error("❌ SignUp API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  // Sign in existing user
  static async signIn(credentials) {
    try {
      console.log(`🔐 Signing in user to: ${this.API_BASE_URL}/auth/login`);

      const serverCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      console.log(`🔐 Credentials:`, {
        ...serverCredentials,
        password: "[HIDDEN]",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log("⏰ SignIn request timed out");
      }, 15000);

      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(serverCredentials),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`🔐 SignIn response status: ${response.status}`);

      let data;
      try {
        data = await response.json();
        console.log(`🔐 SignIn response data:`, data);
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.log(`❌ SignIn failed with status: ${response.status}`);

        // Enhanced error handling
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else if (response.status === 400) {
          // Handle array of validation errors
          if (Array.isArray(data.message)) {
            throw new Error(data.message.join(", "));
          } else {
            throw new Error(data.message || "Invalid login data");
          }
        } else if (response.status === 404) {
          throw new Error("User not found");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      console.log("✅ SignIn successful");

      const transformedUser = {
        ...data.user,
        name: data.user?.username || data.user?.name,
      };

      const token = data.token || data.access_token;

      console.log(`🔑 Token extracted:`, token ? "Present" : "Missing");

      return {
        user: transformedUser,
        message: data.message || "Login successful",
        token: token,
      };
    } catch (error) {
      console.error("❌ SignIn API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  // Get user profile
  static async getProfile(token) {
    try {
      console.log(
        `👤 Getting profile with token: ${
          token ? token.substring(0, 20) + "..." : "NONE"
        }`
      );

      if (!token) {
        throw new Error("No authentication token provided");
      }

      console.log(
        "⚠️ Using simplified profile response (endpoint not available)"
      );

      try {
        const response = await fetch(`${this.API_BASE_URL}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return {
            ...data,
            name: data.username || data.name,
          };
        }
      } catch (error) {
        console.log("Profile endpoint not available, using token data");
      }

      return {
        id: "current_user",
        name: "Current User",
        email: "user@example.com",
      };
    } catch (error) {
      console.error("❌ Get Profile API Error:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(token, profileData) {
    try {
      console.log(`📝 Updating profile with data:`, profileData);

      if (!token) {
        throw new Error("No authentication token provided");
      }

      console.log(
        "⚠️ Using simplified profile update (endpoint not available)"
      );

      return {
        user: {
          name: profileData.name,
          email: profileData.email || "user@example.com",
          gender: profileData.gender,
        },
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("❌ Update Profile API Error:", error);
      throw error;
    }
  }

  // Create learning record
  static async createLearningRecord(token, drugData) {
    try {
      console.log(`📚 Creating learning record for drug:`, drugData);

      if (!token) {
        console.log("⚠️ No token, skipping backend sync");
        return { success: true };
      }

      console.log(
        "⚠️ Simulating learning record creation (backend endpoint not available)"
      );
      return { success: true, message: "Learning record created" };
    } catch (error) {
      console.error("❌ Create Learning Record API Error:", error);

      return { success: false, error: error.message };
    }
  }

  // Update learning record
  static async updateLearningRecord(token, drugId, updateData) {
    try {
      console.log(`📝 Updating learning record ${drugId}:`, updateData);

      if (!token) {
        console.log("⚠️ No token, skipping backend sync");
        return { success: true };
      }

      console.log(
        "⚠️ Simulating learning record update (backend endpoint not available)"
      );
      return { success: true, message: "Learning record updated" };
    } catch (error) {
      console.error("❌ Update Learning Record API Error:", error);

      return { success: false, error: error.message };
    }
  }

  // Delete learning record
  static async deleteLearningRecord(token, drugId) {
    try {
      console.log(`🗑️ Deleting learning record for drug ${drugId}`);

      if (!token) {
        console.log("⚠️ No token, skipping backend sync");
        return { success: true };
      }

      console.log(
        "⚠️ Simulating learning record deletion (backend endpoint not available)"
      );
      return { success: true, message: "Learning record deleted" };
    } catch (error) {
      console.error("❌ Delete Learning Record API Error:", error);

      return { success: false, error: error.message };
    }
  }

  // Update user score
  static async updateUserScore(token, scoreData) {
    try {
      console.log(`🎯 Updating user score:`, scoreData);

      if (!token) {
        console.log("⚠️ No token, skipping backend sync");
        return { success: true };
      }

      console.log(
        "⚠️ Simulating score update (backend endpoint not available)"
      );
      return { success: true, message: "Score updated" };
    } catch (error) {
      console.error("❌ Update User Score API Error:", error);

      return { success: false, error: error.message };
    }
  }

  // Sync learning state with backend
  static async syncLearningState(token, learningState) {
    try {
      console.log(`🔄 Syncing learning state with backend:`, learningState);

      if (!token) {
        console.log("⚠️ No token, skipping backend sync");
        return { success: true };
      }

      console.log(
        "⚠️ Simulating learning state sync (backend endpoint not available)"
      );
      return { success: true, message: "Learning state synced" };
    } catch (error) {
      console.error("❌ Sync Learning State API Error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all users
  static async getAllUsers(token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${this.API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        } else if (response.status === 403) {
          throw new Error("Forbidden - Insufficient permissions");
        } else {
          throw new Error(data.message || "Failed to fetch users");
        }
      }

      const transformedUsers = Array.isArray(data)
        ? data.map((user) => ({
            ...user,
            name: user.username || user.name,
          }))
        : data;

      return transformedUsers;
    } catch (error) {
      console.error("❌ Get All Users API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  // Study Records API methods
  static async getStudyRecords(token, userId = null) {
    try {
      const url = userId
        ? `${this.API_BASE_URL}/study-record/${userId}`
        : `${this.API_BASE_URL}/study-record`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        } else {
          throw new Error(data.message || "Failed to fetch study records");
        }
      }

      return data;
    } catch (error) {
      console.error("❌ Get Study Records API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  static async createStudyRecord(token, recordData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${this.API_BASE_URL}/study-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        } else if (response.status === 400) {
          throw new Error(data.message || "Invalid study record data");
        } else {
          throw new Error(data.message || "Failed to create study record");
        }
      }

      return {
        record: data,
        message: "Study record created successfully",
      };
    } catch (error) {
      console.error("❌ Create Study Record API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  static async updateStudyRecord(token, recordId, recordData) {
    try {
      const url = `${this.API_BASE_URL}/study-record/${recordId}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        } else if (response.status === 400) {
          throw new Error(data.message || "Invalid study record data");
        } else if (response.status === 404) {
          throw new Error("Study record not found");
        } else {
          throw new Error(data.message || "Failed to update study record");
        }
      }

      return {
        record: data,
        message: "Study record updated successfully",
      };
    } catch (error) {
      console.error("❌ Update Study Record API Error:", error);
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout - Please check your internet connection"
        );
      }
      throw error;
    }
  }

  // Expo-specific network diagnostics
  static async runExpoDiagnostics() {
    console.log("🔧 Running Expo network diagnostics...");

    const info = {
      platform: Platform.OS,
      expoVersion: Constants.expoVersion,
      deviceName: Constants.deviceName,
      isDevice: Constants.isDevice,
      baseUrl: this.API_BASE_URL,
      yourComputerIP: YOUR_COMPUTER_IP,
    };

    console.log("📱 Expo Environment:", info);

    const testResult = await this.testConnection();
    console.log(`🌐 Server reachable: ${testResult}`);

    return { info, serverReachable: testResult };
  }
}

export default AuthAPI;
