import { View, Text, ScrollView, TouchableOpacity, FlatList, Modal, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { conversationManager, ConversationSummary } from "@/lib/conversation-manager";
import * as Haptics from "expo-haptics";

interface ConversationSwitcherProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: (title: string) => void;
}

export function ConversationSwitcher({
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
}: ConversationSwitcherProps) {
  const colors = useColors();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const convs = await conversationManager.listConversations(false);
      setConversations(convs);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newTitle.trim()) {
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const conv = await conversationManager.createConversation(newTitle);
      await conversationManager.setActiveConversation(conv.id);
      onCreateConversation(conv.id);
      setNewTitle("");
      setShowModal(false);
      await loadConversations();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await conversationManager.setActiveConversation(conversationId);
      onSelectConversation(conversationId);
    } catch (error) {
      console.error("Failed to select conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await conversationManager.deleteConversation(conversationId);
      await loadConversations();

      if (currentConversationId === conversationId) {
        const remaining = await conversationManager.listConversations(false);
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationSummary }) => {
    const isActive = item.id === currentConversationId;

    return (
      <TouchableOpacity
        className="p-3 mb-2 rounded-lg flex-row items-center justify-between"
        style={{
          backgroundColor: isActive ? colors.primary : colors.surface,
        }}
        onPress={() => handleSelectConversation(item.id)}
      >
        <View className="flex-1">
          <Text
            className="font-semibold text-sm"
            style={{
              color: isActive ? "white" : colors.foreground,
            }}
            numberOfLines={1}
          >
            {item.pinned && "📌 "}
            {item.title}
          </Text>
          <Text
            className="text-xs mt-1"
            style={{
              color: isActive ? "rgba(255,255,255,0.7)" : colors.muted,
            }}
          >
            {item.messageCount} messages
          </Text>
        </View>

        <TouchableOpacity
          className="p-2 ml-2 active:opacity-70"
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Text className="text-lg">🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }} className="font-bold text-lg">
            💬 Conversations
          </Text>
          <TouchableOpacity
            className="p-2 rounded-lg active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setShowModal(true)}
          >
            <Text className="text-white text-lg">+</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text style={{ color: colors.muted }} className="text-sm">
            Loading...
          </Text>
        ) : conversations.length === 0 ? (
          <Text style={{ color: colors.muted }} className="text-sm">
            No conversations yet. Create one to get started!
          </Text>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />
        )}
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="p-6 rounded-t-2xl gap-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.foreground }} className="text-xl font-bold">
                New Conversation
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="p-3 rounded-lg border text-sm"
              style={{
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholder="Enter conversation title"
              placeholderTextColor={colors.muted}
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleCreateConversation}
            />

            <TouchableOpacity
              className="p-3 rounded-lg active:opacity-70"
              style={{ backgroundColor: colors.primary }}
              onPress={handleCreateConversation}
            >
              <Text className="text-white font-semibold text-center">Create Conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-3 rounded-lg active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: colors.foreground }} className="font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
