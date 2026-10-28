import PersonalJournalCreateCard from "@/templates/personal-journal-create-card";
import { Tabs } from "expo-router";
import { MdAutoStories } from "react-icons/md";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function PersonalJournalScreen() {
  return (
    <SafeAreaView>
      <PersonalJournalCreateCard />
      <ScrollView></ScrollView>
    </SafeAreaView>
  );
}
