import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { createElement, type CSSProperties } from "react";
import { View } from "react-native";

const PDF_DOCUMENT = require("../../../assets/others/TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO TDICs.pdf");
const pdfUri = Asset.fromModule(PDF_DOCUMENT).uri;

const iframeStyle: CSSProperties = {
  border: 0,
  flex: 1,
  width: "100%",
  minHeight: 0,
};

export default function LegalTermsScreen() {
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: "Termos e Política de Privacidade",
          presentation: "fullScreenModal",
          headerShown: true,
        }}
      />
      {createElement("iframe", {
        src: pdfUri,
        title: "Termo de consentimento",
        style: iframeStyle,
      })}
    </View>
  );
}
