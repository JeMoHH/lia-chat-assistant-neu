import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useGeneration } from "@/lib/generation-context";
import { IMG2IMG_MODELS, type GenerationModel } from "@/types/generation";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Img2ImgTransformerProps {
  sourceImage: string;
  onImageTransformed?: (imageUrl: string) => void;
}

export function Img2ImgTransformer({ sourceImage, onImageTransformed }: Img2ImgTransformerProps) {
  const colors = useColors();
  const { generateImg2Img, state } = useGeneration();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<GenerationModel>("stable-diffusion-xl");
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [strength, setStrength] = useState("0.75");

  const handleTransform = async () => {
    if (!prompt.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await generateImg2Img({
      image_url: sourceImage,
      prompt: prompt.trim(),
      model: selectedModel,
      strength: parseFloat(strength),
      steps: 20,
    });

    if (result?.result_url) {
      setTransformedImage(result.result_url);
      onImageTransformed?.(result.result_url);
    }
  };

  return (
    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
      <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
        🔄 Image to Image
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

      {/* Prompt Input */}
      <TextInput
        className="rounded-lg p-3 mb-3 text-base"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground,
          borderColor: colors.border,
          borderWidth: 1,
        }}
        placeholder="Describe how to transform the image..."
        placeholderTextColor={colors.muted}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={2}
        editable={!state.isGenerating}
      />

      {/* Strength Slider */}
      <View className="mb-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Transformation Strength:
          </Text>
          <Text className="text-sm" style={{ color: colors.primary }}>
            {(parseFloat(strength) * 100).toFixed(0)}%
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
              width: `${parseFloat(strength) * 100}%`,
              height: "100%",
              backgroundColor: colors.primary,
            }}
          />
        </View>
        <Text className="text-xs mt-1" style={{ color: colors.muted }}>
          0.3 (subtle) — 0.75 (balanced) — 1.0 (strong)
        </Text>
      </View>

      {/* Model Selection */}
      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
        Model:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {Object.entries(IMG2IMG_MODELS).map(([model, label]) => (
            <TouchableOpacity
              key={model}
              className="px-3 py-2 rounded-full active:opacity-70"
              style={{
                backgroundColor: selectedModel === model ? colors.primary : colors.background,
              }}
              onPress={() => setSelectedModel(model as GenerationModel)}
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

      {/* Transform Button */}
      <TouchableOpacity
        className="rounded-lg p-3 items-center justify-center active:opacity-80"
        style={{
          backgroundColor: prompt.trim() && !state.isGenerating ? colors.primary : colors.muted,
        }}
        onPress={handleTransform}
        disabled={!prompt.trim() || state.isGenerating}
      >
        {state.isGenerating ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="text-white font-semibold">Transforming...</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold">Transform Image</Text>
        )}
      </TouchableOpacity>

      {/* Transformed Image Preview */}
      {transformedImage && (
        <View className="mt-4">
          <Image
            source={{ uri: transformedImage }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />
          <Text className="text-xs text-center" style={{ color: colors.muted }}>
            ✅ Image transformed successfully
          </Text>
        </View>
      )}
    </View>
  );
}
