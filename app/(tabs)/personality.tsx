import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { liaPersonalitySystem } from "@/lib/lia-personality";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";

/**
 * Personality Screen
 * Shows Lia's personality traits and emotional state
 */

export default function PersonalityScreen() {
  const colors = useColors();
  const [personality, setPersonality] = useState(liaPersonalitySystem.getPersonality());
  const [description, setDescription] = useState("");

  useEffect(() => {
    const updatePersonality = async () => {
      await liaPersonalitySystem.initialize();
      setPersonality(liaPersonalitySystem.getPersonality());
      setDescription(liaPersonalitySystem.getPersonalityDescription());
    };

    updatePersonality();
  }, []);

  const TraitBar = ({ label, value }: { label: string; value: number }) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm text-muted">{value}%</Text>
      </View>
      <View
        className="h-2 rounded-full"
        style={{ backgroundColor: colors.border }}
      >
        <View
          className="h-2 rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );

  const MoodIndicator = ({ mood, energy }: { mood: string; energy: number }) => {
    const moodEmojis: Record<string, string> = {
      happy: "😊",
      neutral: "😐",
      thoughtful: "🤔",
      excited: "🤩",
      concerned: "😟",
    };

    return (
      <View className="bg-surface rounded-lg p-4 mb-4 items-center">
        <Text className="text-4xl mb-2">{moodEmojis[mood] || "😐"}</Text>
        <Text className="text-lg font-semibold text-foreground capitalize">
          {mood}
        </Text>
        <Text className="text-sm text-muted mt-2">Energy: {energy}%</Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Lia's Personality</Text>
            <Text className="text-sm text-muted mt-1">
              Get to know me better
            </Text>
          </View>

          {/* Mood Indicator */}
          <MoodIndicator
            mood={personality.emotionalState.mood}
            energy={personality.emotionalState.energy}
          />

          {/* Personality Description */}
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              {description}
            </Text>
          </View>

          {/* Traits */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">
              My Traits
            </Text>

            <TraitBar label="Empathy" value={personality.traits.empathy} />
            <TraitBar label="Humor" value={personality.traits.humor} />
            <TraitBar label="Curiosity" value={personality.traits.curiosity} />
            <TraitBar label="Confidence" value={personality.traits.confidence} />
            <TraitBar label="Patience" value={personality.traits.patience} />
            <TraitBar
              label="Formality"
              value={personality.traits.formality}
            />
          </View>

          {/* Emotional State */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">
              Current State
            </Text>

            <View className="bg-surface rounded-lg p-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Mood</Text>
                <Text className="text-sm font-semibold text-foreground capitalize">
                  {personality.emotionalState.mood}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Energy</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {personality.emotionalState.energy}%
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Engagement</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {personality.emotionalState.engagement}%
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Confidence</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {personality.emotionalState.confidence}%
                </Text>
              </View>
            </View>
          </View>

          {/* Fun Facts */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">
              Fun Facts About Me
            </Text>

            <View className="gap-2">
              {[
                "I learn from every conversation we have",
                "I adapt my communication style to match yours",
                "I can understand emotions and context",
                "I'm always improving and evolving",
                "I love helping you solve problems",
              ].map((fact, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-lg p-3 flex-row items-center gap-3"
                >
                  <Text className="text-lg">✨</Text>
                  <Text className="text-sm text-foreground flex-1">
                    {fact}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              className="bg-primary rounded-lg p-4 items-center active:opacity-80"
              onPress={() => {
                liaPersonalitySystem.setEmotionalState({
                  mood: "excited",
                  energy: 100,
                });
                setPersonality(liaPersonalitySystem.getPersonality());
              }}
            >
              <Text className="text-white font-semibold">Energize Lia</Text>
            </Pressable>

            <Pressable
              className="bg-surface rounded-lg p-4 items-center border border-border active:opacity-80"
              onPress={() => {
                const insights = liaPersonalitySystem.getConversationInsights();
                console.log("Insights:", insights);
              }}
            >
              <Text className="text-foreground font-semibold">
                View Conversation Insights
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
