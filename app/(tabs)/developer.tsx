import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { CodeEditor, type CodeLanguage } from "@/components/code-editor";
import { TerminalOutput } from "@/components/terminal-output";
import { CodeAnalysis } from "@/components/code-analysis";
import { useColors } from "@/hooks/use-colors";
import { analyzeCode, type AnalysisResult } from "@/lib/code-analyzer";
import { executeCode, type ExecutionResult } from "@/lib/terminal-service";
import * as Haptics from "expo-haptics";

type TabType = "editor" | "output" | "analysis";

export default function DeveloperScreen() {
  const colors = useColors();
  const [code, setCode] = useState("// Write your code here\nconsole.log('Hello, Developer!');");
  const [language, setLanguage] = useState<CodeLanguage>("javascript");
  const [activeTab, setActiveTab] = useState<TabType>("editor");
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteCode = useCallback(
    async (codeToExecute: string, lang: CodeLanguage) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setIsExecuting(true);
      setActiveTab("output");

      try {
        const result = await executeCode(codeToExecute, lang);
        setExecutionResult(result);
      } catch (error) {
        setExecutionResult({
          stdout: "",
          stderr: error instanceof Error ? error.message : "Execution failed",
          exitCode: 1,
          duration: 0,
          language: lang,
        });
      } finally {
        setIsExecuting(false);
      }
    },
    []
  );

  const handleAnalyzeCode = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = analyzeCode(code, language);
    setAnalysisResult(result);
    setActiveTab("analysis");
  }, [code, language]);

  const handleClearOutput = useCallback(() => {
    setExecutionResult(null);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleLanguageChange = useCallback((newLanguage: CodeLanguage) => {
    setLanguage(newLanguage);
  }, []);

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View
        className="px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          💻 Developer Tools
        </Text>
        <Text className="text-xs mt-1" style={{ color: colors.muted }}>
          Code editor with multi-language support
        </Text>
      </View>

      {/* Tabs */}
      <View
        className="flex-row border-b"
        style={{ borderBottomColor: colors.border }}
      >
        {(["editor", "output", "analysis"] as TabType[]).map((tab) => (
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
              {tab === "editor" && "📝 Editor"}
              {tab === "output" && "📤 Output"}
              {tab === "analysis" && "🔍 Analysis"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "editor" && (
          <CodeEditor
            initialCode={code}
            language={language}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
            onExecute={handleExecuteCode}
          />
        )}

        {activeTab === "output" && (
          <TerminalOutput
            result={executionResult || undefined}
            isLoading={isExecuting}
            onClear={handleClearOutput}
          />
        )}

        {activeTab === "analysis" && (
          <CodeAnalysis result={analysisResult || undefined} />
        )}
      </View>

      {/* Action Buttons */}
      {activeTab === "editor" && (
        <View className="px-4 py-3 flex-row gap-2 border-t" style={{ borderTopColor: colors.border }}>
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg items-center active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={() => handleExecuteCode(code, language)}
            disabled={isExecuting}
          >
            <Text className="text-white font-semibold">
              {isExecuting ? "⏳ Running..." : "▶️ Run Code"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg items-center active:opacity-70"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            onPress={handleAnalyzeCode}
          >
            <Text style={{ color: colors.foreground }} className="font-semibold">
              🔍 Analyze
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
