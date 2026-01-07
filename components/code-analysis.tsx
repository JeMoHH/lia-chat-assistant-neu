import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import type { AnalysisResult, CodeIssue } from "@/lib/code-analyzer";

interface CodeAnalysisProps {
  result?: AnalysisResult;
  onSelectIssue?: (issue: CodeIssue) => void;
}

export function CodeAnalysis({ result, onSelectIssue }: CodeAnalysisProps) {
  const colors = useColors();

  if (!result) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.surface }}
      >
        <Text style={{ color: colors.muted }} className="text-sm">
          Analyze code to see issues
        </Text>
      </View>
    );
  }

  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;
  const infoCount = result.issues.filter((i) => i.severity === "info").length;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        className="px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
          Code Analysis
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">❌</Text>
            <Text style={{ color: colors.error }} className="text-xs font-semibold">
              {errorCount}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">⚠️</Text>
            <Text style={{ color: colors.warning }} className="text-xs font-semibold">
              {warningCount}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">ℹ️</Text>
            <Text style={{ color: colors.muted }} className="text-xs font-semibold">
              {infoCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics */}
      <View className="px-4 py-3 border-b gap-2" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row justify-between items-center">
          <Text style={{ color: colors.muted }} className="text-xs">
            Lines of Code:
          </Text>
          <Text style={{ color: colors.foreground }} className="text-xs font-semibold">
            {result.metrics.lines}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text style={{ color: colors.muted }} className="text-xs">
            Complexity:
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-row gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  className="h-1 rounded-full"
                  style={{
                    width: 8,
                    backgroundColor:
                      i < result.metrics.complexity
                        ? i < 3
                          ? colors.success
                          : i < 6
                          ? colors.warning
                          : colors.error
                        : colors.border,
                  }}
                />
              ))}
            </View>
            <Text style={{ color: colors.foreground }} className="text-xs font-semibold">
              {result.metrics.complexity}/10
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text style={{ color: colors.muted }} className="text-xs">
            Maintainability:
          </Text>
          <Text
            style={{
              color:
                result.metrics.maintainability >= 80
                  ? colors.success
                  : result.metrics.maintainability >= 60
                  ? colors.warning
                  : colors.error,
            }}
            className="text-xs font-semibold"
          >
            {result.metrics.maintainability}%
          </Text>
        </View>
      </View>

      {/* Issues List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {result.issues.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-2xl mb-2">✨</Text>
            <Text style={{ color: colors.muted }} className="text-sm">
              No issues found!
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {result.issues.map((issue, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: colors.background,
                  borderColor:
                    issue.severity === "error"
                      ? colors.error
                      : issue.severity === "warning"
                      ? colors.warning
                      : colors.border,
                }}
                onPress={() => onSelectIssue?.(issue)}
              >
                <View className="flex-row items-start gap-2">
                  <Text className="text-lg mt-1">
                    {issue.severity === "error"
                      ? "❌"
                      : issue.severity === "warning"
                      ? "⚠️"
                      : "ℹ️"}
                  </Text>
                  <View className="flex-1">
                    <Text
                      style={{
                        color:
                          issue.severity === "error"
                            ? colors.error
                            : issue.severity === "warning"
                            ? colors.warning
                            : colors.muted,
                      }}
                      className="text-xs font-semibold"
                    >
                      {issue.message}
                    </Text>
                    <Text style={{ color: colors.muted }} className="text-xs mt-1">
                      Line {issue.line}, Column {issue.column}
                    </Text>
                    {issue.fix && (
                      <Text style={{ color: colors.primary }} className="text-xs mt-1 font-semibold">
                        💡 {issue.fix}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
