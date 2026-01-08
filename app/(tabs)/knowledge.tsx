import { ScrollView, Text, View, Pressable, TextInput, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { expertKnowledgeBase } from "@/lib/expert-knowledge-base";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";

/**
 * Expert Knowledge Screen
 * Browse and search Lia's expert knowledge across domains
 */

export default function KnowledgeScreen() {
  const colors = useColors();
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const initKnowledge = async () => {
      await expertKnowledgeBase.initialize();
      setDomains(expertKnowledgeBase.getDomains());
      setStats(expertKnowledgeBase.getStatistics());
    };

    initKnowledge();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = expertKnowledgeBase.search(searchQuery);
      setSearchResults(results);
    }
  };

  const handleDomainSelect = async (domain: string) => {
    setSelectedDomain(domain);
    const knowledge = expertKnowledgeBase.getKnowledgeForDomain(domain);
    setSearchResults(knowledge);
  };

  const DomainCard = ({ domain }: { domain: string }) => (
    <Pressable
      className="bg-surface rounded-lg p-4 mb-3 active:opacity-80"
      onPress={() => handleDomainSelect(domain)}
    >
      <Text className="text-lg font-semibold text-foreground capitalize">
        {domain.replace("-", " ")}
      </Text>
      <Text className="text-xs text-muted mt-1">
        Tap to explore expertise
      </Text>
    </Pressable>
  );

  const KnowledgeCard = ({ entry }: { entry: any }) => (
    <View className="bg-surface rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-semibold text-foreground flex-1">
          {entry.topic}
        </Text>
        <View className="bg-primary rounded-full px-2 py-1">
          <Text className="text-xs text-white font-semibold">
            {Math.round(entry.confidence * 100)}%
          </Text>
        </View>
      </View>

      <Text className="text-xs text-muted mb-2 capitalize">
        {entry.domain} • {entry.difficulty}
      </Text>

      <Text className="text-sm text-foreground leading-relaxed">
        {entry.content.substring(0, 150)}...
      </Text>

      {entry.relatedTopics && entry.relatedTopics.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {entry.relatedTopics.slice(0, 3).map((topic: string, idx: number) => (
            <View
              key={idx}
              className="bg-background rounded-full px-2 py-1 border border-border"
            >
              <Text className="text-xs text-muted">{topic}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              Expert Knowledge
            </Text>
            <Text className="text-sm text-muted mt-1">
              Explore Lia's expertise across all domains
            </Text>
          </View>

          {/* Statistics */}
          {stats && (
            <View className="bg-surface rounded-lg p-4 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total Domains</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {stats.totalDomains}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Knowledge Entries</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {stats.totalEntries}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Average Confidence</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {Math.round(stats.averageConfidence * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* Search */}
          <View>
            <TextInput
              placeholder="Search knowledge..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              className="bg-surface text-foreground border border-border rounded-lg px-4 py-3"
            />
          </View>

          {/* Results or Domains */}
          {searchResults.length > 0 ? (
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-foreground">
                  Results
                </Text>
                <Pressable
                  onPress={() => {
                    setSearchResults([]);
                    setSelectedDomain(null);
                    setSearchQuery("");
                  }}
                >
                  <Text className="text-sm text-primary font-semibold">
                    Clear
                  </Text>
                </Pressable>
              </View>

              <FlatList
                scrollEnabled={false}
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <KnowledgeCard entry={item} />}
              />
            </View>
          ) : (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Domains
              </Text>

              <FlatList
                scrollEnabled={false}
                data={domains}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <DomainCard domain={item} />}
              />
            </View>
          )}

          {/* Footer Info */}
          <View className="bg-surface rounded-lg p-4 mt-4">
            <Text className="text-xs text-muted leading-relaxed">
              💡 Tip: I'm constantly learning and expanding my knowledge base.
              The more we interact, the smarter I become!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
