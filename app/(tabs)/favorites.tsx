import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function FavoritesScreen() {
  const colors = useColors();
  const { state, removeFavorite, createCollection, deleteCollection } = useFavorites();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const filteredFavorites = selectedCollection
    ? state.favorites.filter((f) => f.collectionId === selectedCollection)
    : state.favorites;

  const handleRemoveFavorite = (id: string) => {
    Alert.alert("Remove Favorite", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeFavorite(id);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      },
    ]);
  };

  const handleCreateCollection = () => {
    Alert.prompt(
      "New Collection",
      "Enter collection name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (name: string | undefined) => {
            if (name?.trim()) {
              createCollection(name, "");
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          },
        },
      ],
      "plain-text"
    );
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              ❤️ Favorites
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {state.favorites.length} saved images
            </Text>
          </View>
          <TouchableOpacity
            className="px-4 py-2 rounded-full active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={handleCreateCollection}
          >
            <Text className="text-white font-semibold text-sm">+ Collection</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Collections */}
      {state.collections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              selectedCollection === null ? "opacity-100" : "opacity-60"
            }`}
            style={{
              backgroundColor: selectedCollection === null ? colors.primary : colors.surface,
            }}
            onPress={() => setSelectedCollection(null)}
          >
            <Text
              className="font-semibold text-sm"
              style={{
                color: selectedCollection === null ? "#FFFFFF" : colors.foreground,
              }}
            >
              All
            </Text>
          </TouchableOpacity>

          {state.collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              className={`px-4 py-2 rounded-full ${
                selectedCollection === collection.id ? "opacity-100" : "opacity-60"
              }`}
              style={{
                backgroundColor:
                  selectedCollection === collection.id ? colors.primary : colors.surface,
              }}
              onPress={() => setSelectedCollection(collection.id)}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color:
                    selectedCollection === collection.id ? "#FFFFFF" : colors.foreground,
                }}
              >
                {collection.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Favorites Grid */}
      {filteredFavorites && filteredFavorites.length > 0 ? (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item: favorite }) => (
            <View className="flex-1 rounded-lg overflow-hidden" style={{ backgroundColor: colors.surface }}>
              <Image
                source={{ uri: favorite.imageUrl }}
                style={{ width: "100%", height: 150 }}
              />
              <View className="p-2">
                <Text className="text-xs font-semibold mb-2" style={{ color: colors.foreground }} numberOfLines={1}>
                  {favorite.prompt.substring(0, 20)}...
                </Text>
                <TouchableOpacity
                  className="py-1 rounded active:opacity-70"
                  style={{ backgroundColor: colors.border }}
                  onPress={() => handleRemoveFavorite(favorite.id)}
                >
                  <Text className="text-xs text-center" style={{ color: colors.foreground }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">📭</Text>
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            No Favorites Yet
          </Text>
          <Text className="text-sm text-center px-4 mt-2" style={{ color: colors.muted }}>
            Save your favorite generated images here
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
