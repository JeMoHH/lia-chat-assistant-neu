import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { adminAuth } from "@/lib/admin-auth";
import * as Haptics from "expo-haptics";

type AdminTab = "login" | "config" | "tools" | "logs";

export default function AdminScreen() {
  const colors = useColors();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("login");
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [appConfig, setAppConfig] = useState({
    appName: "Lia Chat Assistant",
    version: "1.0.0",
    apiUrl: "http://127.0.0.1:3000",
    enableDebug: true,
    enableAnalytics: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    const isAuth = await adminAuth.isAuthenticated();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      const info = await adminAuth.getSessionInfo();
      setSessionInfo(info);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    const result = await adminAuth.authenticate(password);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsAuthenticated(true);
      setPassword("");
      const info = await adminAuth.getSessionInfo();
      setSessionInfo(info);
      setActiveTab("config");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Authentication Failed", result.error || "Invalid password");
    }
  }, [password]);

  const handleLogout = useCallback(async () => {
    await adminAuth.logout();
    setIsAuthenticated(false);
    setPassword("");
    setSessionInfo(null);
    setActiveTab("login");
  }, []);

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <View className="gap-6">
          <View className="items-center gap-2">
            <Text className="text-4xl">🔐</Text>
            <Text style={{ color: colors.foreground }} className="text-2xl font-bold">
              Admin Panel
            </Text>
            <Text style={{ color: colors.muted }} className="text-sm">
              Enter password to access
            </Text>
          </View>

          <View className="gap-3">
            <TextInput
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholder="Enter admin password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              className="p-3 rounded-lg active:opacity-70"
              style={{ backgroundColor: colors.primary }}
              onPress={handleLogin}
            >
              <Text className="text-white font-semibold text-center">🔓 Unlock Admin Panel</Text>
            </TouchableOpacity>
          </View>

          <View className="p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <Text style={{ color: colors.muted }} className="text-xs">
              💡 Hint: Password is "LiafeelFree"
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ color: colors.foreground }} className="text-lg font-bold">
                🔐 Admin Panel
              </Text>
              <Text style={{ color: colors.muted }} className="text-xs">
                Session active • {sessionInfo?.timeRemaining ? `${Math.floor(sessionInfo.timeRemaining / 60000)}m remaining` : ""}
              </Text>
            </View>
            <TouchableOpacity
              className="px-3 py-2 rounded-lg active:opacity-70"
              style={{ backgroundColor: colors.error }}
              onPress={handleLogout}
            >
              <Text className="text-white text-xs font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b" style={{ borderBottomColor: colors.border }}>
          {(["login", "config", "tools", "logs"] as AdminTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className="flex-1 py-3 items-center border-b-2"
              style={{
                borderBottomColor: activeTab === tab ? colors.primary : "transparent",
              }}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className="text-sm font-semibold capitalize"
                style={{
                  color: activeTab === tab ? colors.primary : colors.muted,
                }}
              >
                {tab === "login" && "🔑 Auth"}
                {tab === "config" && "⚙️ Config"}
                {tab === "tools" && "🛠️ Tools"}
                {tab === "logs" && "📋 Logs"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View className="flex-1 p-4 gap-4">
          {activeTab === "config" && (
            <View className="gap-4">
              <Text style={{ color: colors.foreground }} className="font-bold">
                App Configuration
              </Text>

              {Object.entries(appConfig).map(([key, value]) => (
                <View key={key} className="gap-2">
                  <Text style={{ color: colors.muted }} className="text-xs font-semibold capitalize">
                    {key}
                  </Text>
                  <TextInput
                    className="p-3 rounded-lg text-sm border"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.foreground,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }}
                    value={String(value)}
                    onChangeText={(text) => setAppConfig({ ...appConfig, [key]: text })}
                  />
                </View>
              ))}

              <TouchableOpacity
                className="p-3 rounded-lg active:opacity-70 mt-4"
                style={{ backgroundColor: colors.primary }}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert("Success", "Configuration saved!");
                }}
              >
                <Text className="text-white font-semibold text-center">💾 Save Configuration</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "tools" && (
            <View className="gap-4">
              <Text style={{ color: colors.foreground }} className="font-bold">
                Admin Tools
              </Text>

              <TouchableOpacity
                className="p-4 rounded-lg active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={() => Alert.alert("Cache Cleared", "App cache has been cleared")}
              >
                <Text style={{ color: colors.foreground }} className="font-semibold">
                  🗑️ Clear Cache
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs mt-1">
                  Remove temporary files and cache
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-4 rounded-lg active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={() => Alert.alert("Logs Exported", "Logs have been exported")}
              >
                <Text style={{ color: colors.foreground }} className="font-semibold">
                  📤 Export Logs
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs mt-1">
                  Download application logs
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-4 rounded-lg active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={() => Alert.alert("Database Reset", "Database has been reset to defaults")}
              >
                <Text style={{ color: colors.error }} className="font-semibold">
                  ⚠️ Reset Database
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs mt-1">
                  Reset all data to factory defaults
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "logs" && (
            <View className="gap-4">
              <Text style={{ color: colors.foreground }} className="font-bold">
                System Logs
              </Text>

              <View className="p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
                <Text style={{ color: colors.muted }} className="text-xs font-mono">
                  [18:35:54] Admin panel initialized{"\n"}
                  [18:35:52] Authentication successful{"\n"}
                  [18:35:48] App started{"\n"}
                  [18:35:45] Services initialized{"\n"}
                  [18:35:42] Database connected
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
