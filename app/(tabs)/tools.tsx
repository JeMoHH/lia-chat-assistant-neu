import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AVAILABLE_TOOLS, type Tool, type ToolCategory } from "@/types/tools";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ToolsScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const categories: Array<{ id: ToolCategory | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "generation", label: "Generation" },
    { id: "search", label: "Search" },
    { id: "utility", label: "Utility" },
    { id: "analysis", label: "Analysis" },
  ];

  const filteredTools = AVAILABLE_TOOLS.filter((tool) => {
    const matchesSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold mb-1" style={{ color: colors.foreground }}>
          Tools & Plugins
        </Text>
        <Text className="text-sm" style={{ color: colors.muted }}>
          {AVAILABLE_TOOLS.length} tools available
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: colors.surface }}>
          <IconSymbol name="paperplane.fill" size={18} color={colors.muted} />
          <TextInput
            className="flex-1 ml-2 text-base"
            style={{ color: colors.foreground }}
            placeholder="Search tools..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-2">
        <View className="flex-row gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="px-4 py-2 rounded-full active:opacity-70"
              style={{
                backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
              }}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selectedCategory === category.id ? "#FFFFFF" : colors.foreground,
                }}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tools Grid */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="flex-row flex-wrap gap-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} colors={colors} />
          ))}
        </View>
        {filteredTools.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-lg" style={{ color: colors.muted }}>
              No tools found
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function ToolCard({ tool, colors }: { tool: Tool; colors: any }) {
  return (
    <TouchableOpacity
      className="rounded-2xl p-4 active:opacity-70"
      style={{
        backgroundColor: colors.surface,
        width: "48%",
        minHeight: 120,
      }}
    >
      <View className="mb-2">
        <Text className="text-3xl">{tool.icon}</Text>
      </View>
      <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
        {tool.name}
      </Text>
      <Text className="text-xs leading-relaxed" style={{ color: colors.muted }} numberOfLines={2}>
        {tool.description}
      </Text>
      <View className="mt-2">
        <View
          className="self-start px-2 py-1 rounded-full"
          style={{ backgroundColor: tool.enabled ? colors.success + "20" : colors.muted + "20" }}
        >
          <Text className="text-xs" style={{ color: tool.enabled ? colors.success : colors.muted }}>
            {tool.enabled ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
