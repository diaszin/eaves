import { BottomSheet } from "@expo/ui";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { MdDisabledByDefault, MdError } from "react-icons/md";
import { useColorScheme, Text, View, TouchableOpacity } from "react-native";

interface ErrorBottomSheetProps {
  error: AxiosError | Error | null;
}

export default function ErrorBottomSheet(props: ErrorBottomSheetProps) {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined | null>(
    null,
  );
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" };

  useEffect(() => {
    if (axios.isAxiosError(props.error)) {
      setErrorMessage(props.error.response?.data["message"]);
    } else {
      setErrorMessage(props.error?.message);
    }

    setOpen(() => props.error != null);
  }, [props.error]);

  return (
    <BottomSheet isPresented={isOpen} onDismiss={() => setOpen(false)}>
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
          <MdDisabledByDefault className="text-error" size="64px" />
        </View>
        <View className="flex flex-col items-center justify-center">
          <Text
            className="font-secondary-medium"
            style={{
              fontSize: 24,
            }}
          >
            Infelizmente houve um erro
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#CECECE",
            }}
          >
            {errorMessage || "Houve um erro interno no nosso servidor!"}
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}
