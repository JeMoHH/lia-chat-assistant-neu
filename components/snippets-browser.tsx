import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { getAllSnippets, searchSnippets, getCategories, getDifficulties, type CodeSnippet } from "@/lib/code-snippets";

interface SnippetsBrowserProps {
  onSelectSnippet?: (snippet: CodeSnippet) => void;
}

export function SnippetsBrowser({ onSelectSnippet }: SnippetsBrowserProps) {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const categories = getCategories();
  const difficulties = getDifficulties();

  const filteredSnippets = searchQuery
    ? searchSnippets(searchQuery)
    : getAllSnippets().filter((s) => {
        if (selectedCategory && s.category !== selectedCategory) return false;
        if (selectedDifficulty && s.difficulty !== selectedDifficulty) return false;
        return true;
      });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return colors.success;
      case "intermediate":
        return colors.warning;
      case "advanced":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const renderSnippet = ({ item }: { item: CodeSnippet }) => (
    <TouchableOpacity
      className="p-3 rounded-lg border mb-2 active:opacity-70"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
      onPress={() => onSelectSnippet?.(item)}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text style={{ color: colors.foreground }} className="font-semibold text-sm">
            {item.title}
          </Text>
          <Text style={{ color: colors.muted }} className="text-xs mt-1">
            {item.description}
          </Text>
          <View className="flex-row gap-2 mt-2 flex-wrap">
            {item.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                className="px-2 py-1 rounded"
                style={{ backgroundColor: colors.background }}
              >
                <Text style={{ color: colors.primary }} className="text-xs">
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className="items-center gap-1">
          <Text
            className="text-xs font-semibold px-2 py-1 rounded"
            style={{
              backgroundColor: getDifficultyColor(item.difficulty),
              color: "#FFFFFF",
            }}
          >
            {item.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Search */}
      <View className="px-4 py-3 gap-2">
        <TextInput
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholder="Search snippets..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className="px-3 py-2 rounded-lg active:opacity-70"
              style={{
                backgroundColor: selectedCategory === cat ? colors.primary : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: selectedCategory === cat ? "#FFFFFF" : colors.foreground,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Difficulty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff}
            className="px-3 py-2 rounded-lg active:opacity-70"
            style={{
              backgroundColor: selectedDifficulty === diff ? getDifficultyColor(diff) : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            onPress={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: selectedDifficulty === diff ? "#FFFFFF" : colors.foreground,
              }}
            >
              {diff}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Snippets List */}
      {filteredSnippets.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl mb-2">🔍</Text>
          <Text style={{ color: colors.muted }} className="text-sm">
            No snippets found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSnippets}
          renderItem={renderSnippet}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
        />
      )}
    </View>
  );
}
