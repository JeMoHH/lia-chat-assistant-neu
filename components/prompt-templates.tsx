import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { PROMPT_TEMPLATES, getCategories, applyTemplate, type PromptTemplate } from "@/types/prompts";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface PromptTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export function PromptTemplates({ onSelectTemplate }: PromptTemplatesProps) {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = getCategories();
  const filteredTemplates = PROMPT_TEMPLATES.filter((t) => {
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: PromptTemplate) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Use template with a default prompt
    const prompt = applyTemplate(template, "a beautiful scene");
    onSelectTemplate(prompt);
  };

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="px-4 py-3 gap-2">
        <TextInput
          className="rounded-full px-4 py-2 text-base"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
          }}
          placeholder="Search templates..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            selectedCategory === null ? "opacity-100" : "opacity-60"
          }`}
          style={{
            backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
          }}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            className="font-semibold"
            style={{
              color: selectedCategory === null ? "#FFFFFF" : colors.foreground,
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category ? "opacity-100" : "opacity-60"
            }`}
            style={{
              backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
            }}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              className="font-semibold text-sm"
              style={{
                color: selectedCategory === category ? "#FFFFFF" : colors.foreground,
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates Grid */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item: template }) => (
          <TouchableOpacity
            className="flex-1 rounded-xl p-4 active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: template.color || colors.border,
            }}
            onPress={() => handleSelectTemplate(template)}
          >
            <Text className="text-3xl mb-2">{template.icon}</Text>
            <Text
              className="font-bold text-sm mb-1"
              style={{ color: colors.foreground }}
            >
              {template.name}
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.muted }}
              numberOfLines={2}
            >
              {template.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
