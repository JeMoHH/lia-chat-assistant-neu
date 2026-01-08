import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { liaSelfUpgradeSystem } from "@/lib/lia-self-upgrade";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";

/**
 * Upgrades Screen
 * Manage Lia's self-upgrades and capabilities
 */

export default function UpgradesScreen() {
  const colors = useColors();
  const [version, setVersion] = useState("");
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [upgradeTasks, setUpgradeTasks] = useState<any[]>([]);
  const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const initUpgrades = async () => {
      await liaSelfUpgradeSystem.initialize();
      setVersion(liaSelfUpgradeSystem.getVersion());
      setCapabilities(liaSelfUpgradeSystem.getCapabilities());
      setUpgradeTasks(liaSelfUpgradeSystem.getUpgradeTasks());
    };

    initUpgrades();
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const newVersion = await liaSelfUpgradeSystem.checkForUpgrades();
      if (newVersion) {
        alert(`New version available: ${newVersion.version}`);
      } else {
        alert("You're running the latest version!");
      }
    } catch (error) {
      alert("Failed to check for updates");
    }
    setChecking(false);
  };

  const handlePerformUpgrade = async () => {
    setChecking(true);
    try {
      const success = await liaSelfUpgradeSystem.autoUpgrade();
      if (success) {
        setVersion(liaSelfUpgradeSystem.getVersion());
        alert("Upgrade completed successfully!");
      } else {
        alert("Upgrade failed. Please try again.");
      }
    } catch (error) {
      alert("Upgrade error");
    }
    setChecking(false);
  };

  const CapabilityCard = ({ capability }: { capability: any }) => (
    <View className="bg-surface rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {capability.name}
          </Text>
          <Text className="text-xs text-muted mt-1">
            v{capability.version}
          </Text>
        </View>
        <View
          className={`rounded-full px-3 py-1 ${
            capability.enabled ? "bg-success" : "bg-error"
          }`}
        >
          <Text className="text-xs text-white font-semibold">
            {capability.enabled ? "Active" : "Disabled"}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-muted">
        Last updated:{" "}
        {new Date(capability.lastUpdated).toLocaleDateString()}
      </Text>

      <Pressable
        className="mt-3 bg-background rounded-lg p-2 items-center active:opacity-80"
        onPress={() => {
          liaSelfUpgradeSystem.toggleCapability(
            capability.name,
            !capability.enabled
          );
          setCapabilities(liaSelfUpgradeSystem.getCapabilities());
        }}
      >
        <Text className="text-xs text-primary font-semibold">
          {capability.enabled ? "Disable" : "Enable"}
        </Text>
      </Pressable>
    </View>
  );

  const UpgradeTaskCard = ({ task }: { task: any }) => (
    <View className="bg-surface rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {task.name}
          </Text>
          <Text className="text-xs text-muted mt-1">{task.description}</Text>
        </View>
        <View
          className={`rounded-full px-2 py-1 ${
            task.status === "completed"
              ? "bg-success"
              : task.status === "failed"
                ? "bg-error"
                : "bg-warning"
          }`}
        >
          <Text className="text-xs text-white font-semibold capitalize">
            {task.status}
          </Text>
        </View>
      </View>

      <View className="bg-background rounded-lg h-2 overflow-hidden">
        <View
          className="h-2 bg-primary"
          style={{ width: `${task.progress}%` }}
        />
      </View>

      <Text className="text-xs text-muted mt-2">{task.progress}% complete</Text>

      {task.error && (
        <Text className="text-xs text-error mt-2">{task.error}</Text>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              Upgrades & Capabilities
            </Text>
            <Text className="text-sm text-muted mt-1">
              Manage Lia's self-upgrades
            </Text>
          </View>

          {/* Version Info */}
          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-muted">Current Version</Text>
                <Text className="text-2xl font-bold text-foreground mt-1">
                  {version}
                </Text>
              </View>
              <View className="bg-primary rounded-full px-4 py-2">
                <Text className="text-white text-xs font-semibold">
                  Latest
                </Text>
              </View>
            </View>
          </View>

          {/* Update Controls */}
          <View className="gap-2">
            <Pressable
              className="bg-primary rounded-lg p-4 items-center active:opacity-80 disabled:opacity-50"
              onPress={handleCheckForUpdates}
              disabled={checking}
            >
              <Text className="text-white font-semibold">
                {checking ? "Checking..." : "Check for Updates"}
              </Text>
            </Pressable>

            <Pressable
              className="bg-success rounded-lg p-4 items-center active:opacity-80 disabled:opacity-50"
              onPress={handlePerformUpgrade}
              disabled={checking}
            >
              <Text className="text-white font-semibold">
                {checking ? "Upgrading..." : "Auto-Upgrade Now"}
              </Text>
            </Pressable>
          </View>

          {/* Auto-Upgrade Toggle */}
          <View className="bg-surface rounded-lg p-4 flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-foreground">
                Auto-Upgrade
              </Text>
              <Text className="text-xs text-muted mt-1">
                Automatically upgrade when available
              </Text>
            </View>
            <Pressable
              className={`rounded-full w-12 h-7 items-center justify-center ${
                autoUpgradeEnabled ? "bg-success" : "bg-muted"
              }`}
              onPress={() => {
                setAutoUpgradeEnabled(!autoUpgradeEnabled);
                liaSelfUpgradeSystem.setAutoUpgrade(!autoUpgradeEnabled);
              }}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white ${
                  autoUpgradeEnabled ? "ml-3" : "-ml-3"
                }`}
              />
            </Pressable>
          </View>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Active Capabilities ({capabilities.length})
              </Text>

              <FlatList
                scrollEnabled={false}
                data={capabilities}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => <CapabilityCard capability={item} />}
              />
            </View>
          )}

          {/* Upgrade Tasks */}
          {upgradeTasks.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Recent Upgrades
              </Text>

              <FlatList
                scrollEnabled={false}
                data={upgradeTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UpgradeTaskCard task={item} />}
              />
            </View>
          )}

          {/* Info */}
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-xs text-muted leading-relaxed">
              🚀 Lia can self-upgrade and add new capabilities automatically.
              You can manage which capabilities are active and check for new
              updates anytime.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
