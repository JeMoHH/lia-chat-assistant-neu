import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useGeneration } from "@/lib/generation-context";
import { IMG2VIDEO_MODELS } from "@/types/generation";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Img2VideoGeneratorProps {
  sourceImage: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

export function Img2VideoGenerator({ sourceImage, onVideoGenerated }: Img2VideoGeneratorProps) {
  const colors = useColors();
  const { generateImg2Video, state } = useGeneration();
  const [selectedModel, setSelectedModel] = useState<"runway-gen3" | "pika-1.0" | "svd">("runway-gen3");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [duration, setDuration] = useState("4");

  const handleGenerateVideo = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await generateImg2Video({
      image_url: sourceImage,
      model: selectedModel,
      motion_bucket_id: 127,
      duration: parseInt(duration),
    });

    if (result?.result_url) {
      setGeneratedVideo(result.result_url);
      onVideoGenerated?.(result.result_url);
    }
  };

  return (
    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
      <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
        🎬 Image to Video
      </Text>

      {/* Source Image Preview */}
      <Image
        source={{ uri: sourceImage }}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 12,
          marginBottom: 12,
        }}
      />

      {/* Duration Slider */}
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Video Duration:
          </Text>
          <Text className="text-sm" style={{ color: colors.primary }}>
            {duration}s
          </Text>
        </View>
        <View
          className="h-2 rounded-full"
          style={{
            backgroundColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${(parseInt(duration) / 10) * 100}%`,
              height: "100%",
              backgroundColor: colors.primary,
            }}
          />
        </View>
        <Text className="text-xs mt-1" style={{ color: colors.muted }}>
          2s (short) — 4s (standard) — 10s (long)
        </Text>
      </View>

      {/* Model Selection */}
      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
        Model:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {Object.entries(IMG2VIDEO_MODELS).map(([model, label]) => (
            <TouchableOpacity
              key={model}
              className="px-3 py-2 rounded-full active:opacity-70"
              style={{
                backgroundColor: selectedModel === model ? colors.primary : colors.background,
              }}
              onPress={() => setSelectedModel(model as any)}
              disabled={state.isGenerating}
            >
              <Text
                className="text-xs font-medium"
                style={{
                  color: selectedModel === model ? "#FFFFFF" : colors.foreground,
                }}
                numberOfLines={1}
              >
                {label.split(" - ")[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Generate Button */}
      <TouchableOpacity
        className="rounded-lg p-3 items-center justify-center active:opacity-80"
        style={{
          backgroundColor: !state.isGenerating ? colors.primary : colors.muted,
        }}
        onPress={handleGenerateVideo}
        disabled={state.isGenerating}
      >
        {state.isGenerating ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="text-white font-semibold">Generating Video...</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold">Generate Video</Text>
        )}
      </TouchableOpacity>

      {/* Generated Video Preview */}
      {generatedVideo && (
        <View className="mt-4">
          <View
            className="w-full h-40 rounded-lg items-center justify-center mb-2"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-4xl mb-2">🎥</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
              Video Generated
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.muted }}>
              Duration: {duration}s
            </Text>
          </View>
          <Text className="text-xs text-center" style={{ color: colors.muted }}>
            ✅ Video generated successfully
          </Text>
        </View>
      )}
    </View>
  );
}
