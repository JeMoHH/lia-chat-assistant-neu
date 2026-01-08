import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  errorCount: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary caught error:", error);
    console.error("Error Info:", errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo: errorInfo.componentStack || null,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-recover after 5 seconds if error count is low
    const currentErrorCount = this.state.errorCount + 1;
    if (currentErrorCount < 3) {
      setTimeout(() => {
        this.resetError();
      }, 5000);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const colors = useColors();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="items-center mb-6">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Oops! Something went wrong
          </Text>
        </View>

        <View className="bg-red-50 p-4 rounded-lg mb-6" style={{ backgroundColor: `${colors.error}20` }}>
          <Text className="font-mono text-xs" style={{ color: colors.error }}>
            {error?.message || "Unknown error"}
          </Text>
        </View>

        <View className="gap-3">
          <TouchableOpacity
            className="p-4 rounded-lg active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={onReset}
          >
            <Text className="text-white font-semibold text-center">Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-lg active:opacity-70"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            onPress={() => {
              // Navigate to home
              console.log("Navigating to home");
            }}
          >
            <Text style={{ color: colors.foreground }} className="font-semibold text-center">
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
          <Text style={{ color: colors.muted }} className="text-xs">
            If the problem persists, please restart the app or contact support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
