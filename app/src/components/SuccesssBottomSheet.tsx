import { BottomSheet } from "@expo/ui";
import { useEffect, useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useColorScheme, Text, View, TouchableOpacity } from "react-native";

interface SuccessBottomSheetProps {
  messsage: string;
  isOpen: boolean;
  onDismiss?: () => void;
}

export default function SuccessBottomSheet(props: SuccessBottomSheetProps) {
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" };

 

  return (
    <BottomSheet
      isPresented={props.isOpen}
      onDismiss={() => {
        props.onDismiss?.();
      }}
    >
      <View
        className="flex flex-col items-center justify-center"
        style={{
          height: 200,
        }}
      >
        <View
          style={{
            marginVertical: 15,
          }}
        >
          <MdCheckCircle className="text-title text-green-500" size="64px" />
        </View>
        <View className="flex flex-col items-center justify-center">
          <Text
            className="font-secondary-medium"
            style={{
              fontSize: 24,
            }}
          >
            {props.messsage}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#CECECE",
            }}
          >
            Feito com sucesso !
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}
