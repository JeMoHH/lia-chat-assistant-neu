import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Image, Modal, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useGeneration } from "@/lib/generation-context";
import { Text2ImgGenerator } from "@/components/text2img-generator";
import { Img2ImgTransformer } from "@/components/img2img-transformer";
import { Img2VideoGenerator } from "@/components/img2video-generator";

export default function GalleryScreen() {
  const colors = useColors();
  const { state } = useGeneration();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showText2Img, setShowText2Img] = useState(true);
  const [showImg2Img, setShowImg2Img] = useState(false);
  const [showImg2Video, setShowImg2Video] = useState(false);

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold mb-1" style={{ color: colors.foreground }}>
          Image & Video Generator
        </Text>
        <Text className="text-sm" style={{ color: colors.muted }}>
          {state.results.length} generations
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Generator Tabs */}
        <View className="px-4 py-4 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center active:opacity-70"
            style={{
              backgroundColor: showText2Img ? colors.primary : colors.surface,
            }}
            onPress={() => {
              setShowText2Img(true);
              setShowImg2Img(false);
              setShowImg2Video(false);
            }}
          >
            <Text
              className="font-semibold"
              style={{
                color: showText2Img ? "#FFFFFF" : colors.foreground,
              }}
            >
              Text → Image
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center active:opacity-70"
            style={{
              backgroundColor: showImg2Img ? colors.primary : colors.surface,
            }}
            onPress={() => {
              setShowText2Img(false);
              setShowImg2Img(true);
              setShowImg2Video(false);
            }}
            disabled={!selectedImage}
          >
            <Text
              className="font-semibold"
              style={{
                color: showImg2Img ? "#FFFFFF" : colors.foreground,
                opacity: !selectedImage ? 0.5 : 1,
              }}
            >
              Image → Image
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-2 rounded-lg items-center active:opacity-70"
            style={{
              backgroundColor: showImg2Video ? colors.primary : colors.surface,
            }}
            onPress={() => {
              setShowText2Img(false);
              setShowImg2Img(false);
              setShowImg2Video(true);
            }}
            disabled={!selectedImage}
          >
            <Text
              className="font-semibold"
              style={{
                color: showImg2Video ? "#FFFFFF" : colors.foreground,
                opacity: !selectedImage ? 0.5 : 1,
              }}
            >
              Image → Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generators */}
        <View className="px-4">
          {showText2Img && (
            <Text2ImgGenerator
              onImageGenerated={(url) => {
                setSelectedImage(url);
                setShowImg2Img(true);
              }}
            />
          )}

          {showImg2Img && selectedImage && (
            <Img2ImgTransformer
              sourceImage={selectedImage}
              onImageTransformed={(url) => setSelectedImage(url)}
            />
          )}

          {showImg2Video && selectedImage && (
            <Img2VideoGenerator
              sourceImage={selectedImage}
              onVideoGenerated={() => {}}
            />
          )}
        </View>

        {/* Results Gallery */}
        {state.results.length > 0 && (
          <View className="px-4 py-4">
            <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
              Recent Generations
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {state.results.slice(0, 6).map((result) => (
                <TouchableOpacity
                  key={result.id}
                  className="rounded-lg overflow-hidden active:opacity-70"
                  style={{ width: "32%", aspectRatio: 1 }}
                  onPress={() => result.result_url && setSelectedImage(result.result_url)}
                >
                  {result.result_url && (
                    <Image
                      source={{ uri: result.result_url }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                  <View
                    className="absolute top-1 right-1 px-2 py-1 rounded"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <Text className="text-xs text-white font-semibold">
                      {result.task === "text2img" && "T2I"}
                      {result.task === "img2img" && "I2I"}
                      {result.task === "img2video" && "I2V"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/80 items-center justify-center"
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "90%",
                height: "70%",
                borderRadius: 12,
              }}
            />
          )}
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
