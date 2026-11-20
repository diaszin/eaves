import { BottomSheet } from "@expo/ui";
import { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
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
        {props.isOpen && (
          <LottieView
            source={require("../../assets/animations/json/success.json")}
            autoPlay
            loop={false}
            style={{ width: 100, height: 100 }}
          />
        )}
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
