import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthAPI from "../services/authApi";

export default function Community() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const currentLearning = useSelector(
    (state) => state.learning.currentLearning
  );
  const finished = useSelector((state) => state.learning.finished);
  const totalScore = useSelector((state) => state.learning.totalScore);

  useEffect(() => {
    if (isLoggedIn && user && currentLearning && finished) {
      const timeoutId = setTimeout(() => {
        saveCurrentUserData();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isLoggedIn,
    user?.id,
    currentLearning?.length,
    finished?.length,
    totalScore,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCommunityRankings();
    }, [user?.token, isLoggedIn])
  );

  const saveCurrentUserData = async () => {
    try {
      if (!user?.id) return;

      const currentUserTotalScore =
        totalScore ||
        (currentLearning || []).reduce(
          (sum, drug) => sum + (drug?.score || 0),
          0
        ) + (finished || []).reduce((sum, drug) => sum + (drug?.score || 0), 0);

      const userData = {
        id: user.id,
        name: user.name || "Current User",
        gender: user.gender,
        totalScore: currentUserTotalScore,
        currentLearning: (currentLearning || []).length,
        finished: (finished || []).length,
        lastUpdated: new Date().toISOString(),
      };

      AsyncStorage.setItem(
        `community_user_${user.id}`,
        JSON.stringify(userData)
      ).catch((error) => {
        console.error("❌ Failed to save user data:", error);
      });

      console.log("Saving user data to community storage:", userData);
    } catch (error) {
      console.error("❌ Failed to save user data:", error);
    }
  };

  const getAllStoredUserData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter((key) =>
        key.startsWith("community_user_")
      );

      const userData = [];
      for (const key of userKeys) {
        try {
          const userDataString = await AsyncStorage.getItem(key);
          if (userDataString) {
            const parsedData = JSON.parse(userDataString);
            userData.push(parsedData);
          }
        } catch (parseError) {
          console.error(
            `❌ Failed to parse user data for key ${key}:`,
            parseError
          );
        }
      }

      console.log("Retrieved stored user data:", userData);
      return userData;
    } catch (error) {
      console.error("❌ Failed to get stored user data:", error);
      return [];
    }
  };

  const fetchCommunityRankings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const storedUserData = await getAllStoredUserData();

      let backendData = [];
      try {
        backendData = await AuthAPI.getAllLearningRecords(user?.token);
        if (Array.isArray(backendData)) {
          backendData = backendData.filter(
            (record) =>
              record.userId &&
              record.user &&
              !record.user.name?.toLowerCase().includes("test") &&
              record.user.name !== "Tom" &&
              record.user.name !== "newName"
          );
        }
      } catch (backendError) {
        backendData = [];
      }

      const processedRankings = processRankingData(backendData, storedUserData);

      const delay = isRefresh ? 500 : 2000;
      setTimeout(() => {
        setRankings(processedRankings);
        setLoading(false);
        setRefreshing(false);
      }, delay);
    } catch (error) {
      console.error("❌ Failed to fetch community rankings:", error);
      setError(error.message);
      const delay = isRefresh ? 500 : 2000;
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, delay);
    }
  };

  const onRefresh = () => {
    fetchCommunityRankings(true);
  };

  const formatGender = (gender) => {
    if (!gender) return "Unknown";
    const genderStr = gender.toString().toLowerCase();
    return genderStr.charAt(0).toUpperCase() + genderStr.slice(1);
  };

  const processRankingData = (backendData, storedData) => {
    const userStats = {};

    if (Array.isArray(backendData) && backendData.length > 0) {
      backendData.forEach((record) => {
        const userId = record.userId || record.user?.id;
        const userName =
          record.user?.name ||
          record.user?.username ||
          record.userName ||
          "Unknown";
        const userGender =
          record.user?.gender || record.userGender || "Unknown";
        const score = record.score || 0;
        const status = record.status || "current";

        if (!userStats[userId]) {
          userStats[userId] = {
            id: userId,
            name: userName,
            gender: formatGender(userGender),
            totalScore: 0,
            currentLearning: 0,
            finished: 0,
            isCurrentUser: false,
            source: "backend",
          };
        }

        userStats[userId].totalScore += score;

        if (status === "finished") {
          userStats[userId].finished += 1;
        } else {
          userStats[userId].currentLearning += 1;
        }
      });
    }

    storedData.forEach((userData) => {
      const userId = userData.id;

      if (userStats[userId]) {
        userStats[userId] = {
          ...userStats[userId],
          name: userData.name,
          gender: formatGender(userData.gender),
          totalScore: Math.max(
            userStats[userId].totalScore,
            userData.totalScore
          ),
          currentLearning: userData.currentLearning,
          finished: userData.finished,
          source: "stored",
        };
      } else {
        userStats[userId] = {
          id: userId,
          name: userData.name,
          gender: formatGender(userData.gender),
          totalScore: userData.totalScore,
          currentLearning: userData.currentLearning,
          finished: userData.finished,
          isCurrentUser: false,
          source: "stored",
        };
      }
    });

    if (isLoggedIn && user?.id) {
      const currentUserTotalScore =
        totalScore ||
        (currentLearning || []).reduce(
          (sum, drug) => sum + (drug?.score || 0),
          0
        ) + (finished || []).reduce((sum, drug) => sum + (drug?.score || 0), 0);
      const currentLearningCount = (currentLearning || []).length;
      const finishedCount = (finished || []).length;

      userStats[user.id] = {
        id: user.id,
        name: user.name || "Current User",
        gender: formatGender(user.gender),
        totalScore: currentUserTotalScore,
        currentLearning: currentLearningCount,
        finished: finishedCount,
        isCurrentUser: true,
        source: "current",
      };
    }

    if (isLoggedIn && user?.id && userStats[user.id]) {
      userStats[user.id].isCurrentUser = true;
    }

    const sortedUsers = Object.values(userStats).sort(
      (a, b) => b.totalScore - a.totalScore
    );

    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    console.log("📊 Final processed rankings:", rankedUsers);
    return rankedUsers;
  };

  const renderRankingItem = ({ item }) => (
    <View
      style={[styles.rankingRow, item.isCurrentUser && styles.currentUserRow]}
    >
      <Text
        style={[styles.rankText, item.isCurrentUser && styles.currentUserText]}
      >
        {item.rank}
      </Text>
      <Text
        style={[styles.nameText, item.isCurrentUser && styles.currentUserText]}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.genderText,
          item.isCurrentUser && styles.currentUserText,
        ]}
      >
        {item.gender}
      </Text>
      <Text
        style={[
          styles.progressText,
          item.isCurrentUser && styles.currentUserText,
        ]}
      >
        {item.totalScore}({item.currentLearning})({item.finished})
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>Rank</Text>
      <Text style={styles.headerText}>Name</Text>
      <Text style={styles.headerText}>Gender</Text>
      <Text style={styles.headerText}>Progress*</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        * The Progress shows Total Score (Current Learning) (Finished)
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No ranking data available</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Student Community</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Community</Text>
        {isLoggedIn && (
          <Text style={styles.subtitle}>Welcome, {user?.name}!</Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load rankings</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {renderHeader()}
          <FlatList
            data={rankings}
            keyExtractor={(item) => item.id?.toString() || item.rank.toString()}
            renderItem={renderRankingItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007bff"]}
                tintColor="#007bff"
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4a9eff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 4,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  list: {
    flex: 1,
    backgroundColor: "#fff",
  },
  rankingRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  rankText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  nameText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  genderText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  progressText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  currentUserRow: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  currentUserText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  footerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "#f8f9fa",
  },
  footerText: {
    fontSize: 12,
    color: "#6c757d",
    fontStyle: "italic",
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
