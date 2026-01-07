import { useRef, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { MessageBubble } from "@/components/message-bubble";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/lib/chat-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

export default function ChatScreen() {
  const colors = useColors();
  const { state, createNewChat, sendMessage, getCurrentChat } = useChat();
  const scrollViewRef = useRef<any>(null);
  const currentChat = getCurrentChat();

  useEffect(() => {
    // Create initial chat if none exists
    if (state.chats.length === 0) {
      createNewChat();
    }
  }, [state.chats.length, createNewChat]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (currentChat?.messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentChat?.messages]);

  const handleNewChat = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    createNewChat();
  };

  const handleSendMessage = async (content: string) => {
    if (!state.currentChatId) {
      createNewChat();
    }
    await sendMessage(content);
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View
        className="px-4 py-3 border-b flex-row items-center justify-between"
        style={{ borderBottomColor: colors.border }}
      >
        <View>
          <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
            {currentChat?.title || "Lia Chat Assistant"}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            AI Assistant with Tools
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
          style={{ backgroundColor: colors.surface }}
          onPress={handleNewChat}
        >
          <Text className="text-2xl" style={{ color: colors.primary }}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
      >
        {!currentChat || currentChat.messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-4xl">✨</Text>
            </View>
            <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
              Welcome to Lia
            </Text>
            <Text className="text-base text-center px-8 mb-6" style={{ color: colors.muted }}>
              Your AI assistant with powerful tools and plugins. Ask me anything!
            </Text>
            <View className="gap-2 px-4">
              <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                Try these commands:
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                • /generate sunset landscape
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                • Ask me anything about tools
              </Text>
            </View>
          </View>
        ) : (
          currentChat.messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </ScrollView>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={state.isLoading || !currentChat} />
    </ScreenContainer>
  );
}
