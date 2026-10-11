import { TouchableOpacity, View, Text } from "react-native";
import { useMultiStepForm } from "../../hooks/useMultiStepForm";
import { ReactFormExtendedApi } from "@tanstack/react-form";
import { useContext } from "react";
import { MultiStepContext } from "../signup";

export default function PersonalStep() {
  const multiStepContext = useContext(MultiStepContext);

  if (!multiStepContext) {
    throw new Error("useContext deve ser usado dentro de um MultiStepProvider");
  }

  return (
    <multiStepContext.form.FormGroup
      name="personal"
      onGroupSubmit={() => multiStepContext.next()}
    >
      {(group) => {
        return (
          <View>
            <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4">
              <TouchableOpacity onPress={group.handleSubmit}>
                <Text>Funcionou</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    </multiStepContext.form.FormGroup>
  );
}
