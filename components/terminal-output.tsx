import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { ExecutionResult } from "@/lib/terminal-service";

interface TerminalOutputProps {
  result?: ExecutionResult;
  isLoading?: boolean;
  onClear?: () => void;
}

export function TerminalOutput({ result, isLoading = false, onClear }: TerminalOutputProps) {
  const colors = useColors();

  if (!result && !isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.surface }}
      >
        <Text style={{ color: colors.muted }} className="text-sm">
          Run code to see output
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        className="px-4 py-3 flex-row items-center justify-between border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
          Terminal Output
        </Text>
        {onClear && (
          <TouchableOpacity
            className="px-3 py-2 rounded-lg active:opacity-70"
            style={{ backgroundColor: colors.background }}
            onPress={onClear}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Output Content */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="gap-2">
            <Text style={{ color: colors.muted }} className="text-sm">
              ⏳ Executing code...
            </Text>
          </View>
        ) : result ? (
          <View className="gap-4">
            {/* Status */}
            <View className="flex-row items-center gap-2">
              {result.exitCode === 0 ? (
                <>
                  <Text className="text-lg">✅</Text>
                  <Text style={{ color: colors.success }} className="font-semibold">
                    Success
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-lg">❌</Text>
                  <Text style={{ color: colors.error }} className="font-semibold">
                    Error
                  </Text>
                </>
              )}
              <Text style={{ color: colors.muted }} className="text-xs ml-auto">
                {result.duration}ms
              </Text>
            </View>

            {/* Stdout */}
            {result.stdout && (
              <View className="gap-2">
                <Text style={{ color: colors.foreground }} className="text-xs font-semibold">
                  📤 Output:
                </Text>
                <View
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text
                    style={{ color: colors.foreground }}
                    className="text-xs font-mono leading-relaxed"
                  >
                    {result.stdout}
                  </Text>
                </View>
              </View>
            )}

            {/* Stderr */}
            {result.stderr && (
              <View className="gap-2">
                <Text style={{ color: colors.error }} className="text-xs font-semibold">
                  ⚠️ Errors:
                </Text>
                <View
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text
                    style={{ color: colors.error }}
                    className="text-xs font-mono leading-relaxed"
                  >
                    {result.stderr}
                  </Text>
                </View>
              </View>
            )}

            {/* Metadata */}
            <View className="gap-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }} className="text-xs">
                  Language:
                </Text>
                <Text style={{ color: colors.foreground }} className="text-xs font-semibold">
                  {result.language}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }} className="text-xs">
                  Exit Code:
                </Text>
                <Text
                  style={{
                    color: result.exitCode === 0 ? colors.success : colors.error,
                  }}
                  className="text-xs font-semibold"
                >
                  {result.exitCode}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
