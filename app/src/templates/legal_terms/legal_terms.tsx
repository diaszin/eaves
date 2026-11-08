import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const PDF_DOCUMENT = require("../../../assets/others/TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO TDICs.pdf");

export default function LegalTermsScreen() {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        const asset = await Asset.fromModule(PDF_DOCUMENT).downloadAsync();
        if (!asset.localUri) {
          throw new Error("O arquivo PDF não foi salvo no dispositivo.");
        }
        if (isMounted) {
          setPdfUri(asset.localUri);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o documento.",
          );
        }
      }
    };

    void loadPdf();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: "Termos e Política de Privacidade",
          presentation: "card",
          headerShown: true,
          headerBackButtonMenuEnabled: true,
        }}
      />
      {pdfUri ? (
        <WebView
          source={{ uri: pdfUri }}
          allowingReadAccessToURL={pdfUri}
          style={{ flex: 1 }}
          originWhitelist={["*"]}
          onError={(event) => {
            setError(event.nativeEvent.description);
            setPdfUri(null);
          }}
        />
      ) : error ? (
        <Text className="m-4 text-center text-red-700">{error}</Text>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator accessibilityLabel="Carregando documento" />
          <Text className="mt-3">Carregando documento...</Text>
        </View>
      )}
    </View>
  );
}
