import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
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
    <View
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="rounded-2xl p-6 gap-4 max-w-sm"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-2xl font-bold" style={{ color: colors.error }}>
          ⚠️ Something went wrong
        </Text>
        <Text style={{ color: colors.muted }} className="text-sm leading-relaxed">
          {error?.message || "An unexpected error occurred. Please try again."}
        </Text>
        <TouchableOpacity
          className="rounded-lg py-3 items-center active:opacity-70"
          style={{ backgroundColor: colors.primary }}
          onPress={onReset}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
