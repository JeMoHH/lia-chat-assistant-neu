import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useGeneration } from "@/lib/generation-context";
import { TEXT2IMG_MODELS, type GenerationModel } from "@/types/generation";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Text2ImgGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export function Text2ImgGenerator({ onImageGenerated }: Text2ImgGeneratorProps) {
  const colors = useColors();
  const { generateText2Img, state } = useGeneration();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<GenerationModel>("stable-diffusion-xl");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await generateText2Img({
      prompt: prompt.trim(),
      model: selectedModel,
      width: 512,
      height: 512,
      steps: 20,
    });

    if (result?.result_url) {
      setGeneratedImage(result.result_url);
      onImageGenerated?.(result.result_url);
    }
  };

  return (
    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
      <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
        🎨 Text to Image
      </Text>

      {/* Prompt Input */}
      <TextInput
        className="rounded-lg p-3 mb-3 text-base"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground,
          borderColor: colors.border,
          borderWidth: 1,
        }}
        placeholder="Describe the image you want to generate..."
        placeholderTextColor={colors.muted}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={3}
        editable={!state.isGenerating}
      />

      {/* Model Selection */}
      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
        Model:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {Object.entries(TEXT2IMG_MODELS).map(([model, label]) => (
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

      {/* Generate Button */}
      <TouchableOpacity
        className="rounded-lg p-3 items-center justify-center active:opacity-80"
        style={{
          backgroundColor: prompt.trim() && !state.isGenerating ? colors.primary : colors.muted,
        }}
        onPress={handleGenerate}
        disabled={!prompt.trim() || state.isGenerating}
      >
        {state.isGenerating ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="text-white font-semibold">Generating...</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold">Generate Image</Text>
        )}
      </TouchableOpacity>

      {/* Generated Image Preview */}
      {generatedImage && (
        <View className="mt-4">
          <Image
            source={{ uri: generatedImage }}
            style={{
              width: "100%",
              height: 300,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />
          <Text className="text-xs text-center" style={{ color: colors.muted }}>
            ✅ Image generated successfully
          </Text>
        </View>
      )}
    </View>
  );
}
