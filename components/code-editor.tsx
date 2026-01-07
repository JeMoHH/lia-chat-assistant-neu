import { useState, useCallback } from "react";
import { View, TextInput, ScrollView, Text, TouchableOpacity, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export type CodeLanguage =
  | "javascript"
  | "python"
  | "bash"
  | "go"
  | "rust"
  | "cpp"
  | "java"
  | "php"
  | "swift"
  | "kotlin"
  | "html"
  | "css"
  | "c"
  | "sql";

interface CodeEditorProps {
  initialCode?: string;
  language?: CodeLanguage;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: CodeLanguage) => void;
  onExecute?: (code: string, language: CodeLanguage) => void;
  readOnly?: boolean;
}

const LANGUAGE_EXTENSIONS: Record<CodeLanguage, string> = {
  javascript: ".js",
  python: ".py",
  bash: ".sh",
  go: ".go",
  rust: ".rs",
  cpp: ".cpp",
  java: ".java",
  php: ".php",
  swift: ".swift",
  kotlin: ".kt",
  html: ".html",
  css: ".css",
  c: ".c",
  sql: ".sql",
};

const LANGUAGES: CodeLanguage[] = [
  "javascript",
  "python",
  "bash",
  "go",
  "rust",
  "cpp",
  "java",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "c",
  "sql",
];

export function CodeEditor({
  initialCode = "",
  language = "javascript",
  onCodeChange,
  onLanguageChange,
  onExecute,
  readOnly = false,
}: CodeEditorProps) {
  const colors = useColors();
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>(language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      onCodeChange?.(newCode);
    },
    [onCodeChange]
  );

  const handleLanguageSelect = useCallback(
    (lang: CodeLanguage) => {
      setSelectedLanguage(lang);
      onLanguageChange?.(lang);
      setShowLanguageMenu(false);
    },
    [onLanguageChange]
  );

  const handleExecute = useCallback(() => {
    onExecute?.(code, selectedLanguage);
  }, [code, selectedLanguage, onExecute]);

  return (
    <View className="flex-1 gap-2" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-3 flex-row items-center justify-between border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Code Editor
          </Text>
          <Text className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.surface, color: colors.primary }}>
            {LANGUAGE_EXTENSIONS[selectedLanguage]}
          </Text>
        </View>
        {onExecute && (
          <TouchableOpacity
            className="px-3 py-2 rounded-lg active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={handleExecute}
          >
            <Text className="text-white text-sm font-semibold">Run</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Language Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            className="px-3 py-2 rounded-lg active:opacity-70"
            style={{
              backgroundColor: selectedLanguage === lang ? colors.primary : colors.surface,
            }}
            onPress={() => handleLanguageSelect(lang)}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: selectedLanguage === lang ? "#FFFFFF" : colors.foreground,
              }}
            >
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Code Input */}
      <View className="flex-1 px-4 gap-2">
        <TextInput
          className="flex-1 p-4 rounded-lg text-sm font-mono"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          value={code}
          onChangeText={handleCodeChange}
          multiline
          editable={!readOnly}
          placeholder={`Enter ${selectedLanguage} code here...`}
          placeholderTextColor={colors.muted}
        />
      </View>

      {/* Line Counter */}
      <View className="px-4 py-2 flex-row justify-between items-center">
        <Text className="text-xs" style={{ color: colors.muted }}>
          Lines: {code.split("\n").length} | Characters: {code.length}
        </Text>
      </View>
    </View>
  );
}
