import { Platform } from "react-native";
import { makeRedirectUri, ResponseType, Prompt } from "expo-auth-session";
import { useAutoDiscovery, useAuthRequest } from "expo-auth-session";
import { useState } from "react";

type ResultData = {
  code?: string;
  verifier?: string;
};

export default function useLoginWithMicrosoft() {
  const [isMicrosoftPrompting, setMicrosoftPrompting] = useState(false);
  const microsoftClientId = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  const microsoftRedirectUri =
    Platform.OS == "web"
      ? process.env.EXPO_PUBLIC_MICROSOFT_REDIRECT_URL!
      : makeRedirectUri({
          scheme: "eaves",
          path: "auth",
        });
  const microsoftDiscovery = useAutoDiscovery(
    "https://login.microsoftonline.com/common/v2.0",
  );
  const [microsoftRequest, , promptMicrosoftLogin] = useAuthRequest(
    {
      clientId: microsoftClientId ?? "",
      redirectUri: microsoftRedirectUri,
      responseType: ResponseType.Code,
      scopes: ["openid", "profile", "email"],
      usePKCE: true,
      prompt: Prompt.SelectAccount,
    },
    microsoftDiscovery,
  );

  async function handleMicrosoftLogin(): Promise<ResultData | null> {
    if (!microsoftClientId) {
      throw new Error("O login Microsoft ainda não foi configurado neste app.");
    }

    if (!microsoftRequest?.codeVerifier || !microsoftDiscovery) {
      throw new Error("Não foi possível iniciar o login Microsoft.");
    }

    setMicrosoftPrompting(true);

    try {
      const result = await promptMicrosoftLogin();
      const code = result.type === "success" ? result.params.code : undefined;

      if (!code) {
        if (result.type === "error") {
          throw new Error("A Microsoft não autorizou o login.");
        }
        return null;
      }

      return {
        ...result,
        code: code,
        verifier: microsoftRequest.codeVerifier,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Não foi possível concluir o login Microsoft.");
      }
    } finally {
      setMicrosoftPrompting(false);
    }
  }

  return {
    handleMicrosoftLogin,
    isSubmitting: isMicrosoftPrompting,
  };
}
