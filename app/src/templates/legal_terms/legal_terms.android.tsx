import PressableScale from "@/shared/components/pressable-scale";
import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import * as Sharing from "expo-sharing";

const PDF_DOCUMENT = require("../../../assets/others/TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO TDICs.pdf");

export default function LegalTermsScreen() {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

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

  const openPdf = async () => {
    if (!pdfUri) return;

    setError(null);
    setIsOpening(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Não há aplicativos disponíveis para abrir o PDF.");
      }
      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: "Abrir termo de consentimento",
      });
    } catch (openError) {
      setError(
        openError instanceof Error
          ? openError.message
          : "Não foi possível abrir o documento.",
      );
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Stack.Screen
        options={{
          title: "Termos e Política de Privacidade",
          presentation: "fullScreenModal",
          headerShown: true,
        }}
      />
      <Text className="mb-6 text-center">
        Abra o termo de consentimento em um aplicativo compatível com PDF.
      </Text>
      {pdfUri ? (
        <PressableScale
          accessibilityRole="button"
          className="rounded-lg bg-blue-600 px-6 py-3"
          disabled={isOpening}
          onPress={() => void openPdf()}
        >
          {isOpening ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="font-primary-bold text-white">
              Abrir documento PDF
            </Text>
          )}
        </PressableScale>
      ) : (
        <ActivityIndicator accessibilityLabel="Carregando documento" />
      )}
      {error ? (
        <Text accessibilityRole="alert" className="mt-4 text-center text-red-700">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
