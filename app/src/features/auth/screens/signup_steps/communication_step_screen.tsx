import { TouchableOpacity, View, Text } from "react-native";
import { useContext } from "react";
import MaskInputWithLabel from "../../components/masked_input_with_label";
import { MultiStepContext } from "../../contexts/multiStepContext";
import { Masks } from "react-native-mask-input";

export default function CommunicationStep() {
  const multiStepContext = useContext(MultiStepContext);
  const cepMask = Masks.ZIP_CODE;
  const phoneMask = Masks.BRL_PHONE;

  if (!multiStepContext) {
    throw new Error("useContext deve ser usado dentro de um MultiStepProvider");
  }

  return (
    <multiStepContext.form.FormGroup
      name="communication"
      onGroupSubmit={() => multiStepContext.next()}
    >
      {(group) => {
        return (
          <View className="w-full">
            <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4 w-full">
              <multiStepContext.form.Field
                name="communication.emergencyPhone"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "O número de contato é obrigatório";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <MaskInputWithLabel
                      defaultValue={undefined}
                      value={field.state.value}
                      onChangeText={(_, value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      label="Contato de emergência"
                      placeholder="(00) 11234-1234"
                      inputMode="numeric"
                      keyboardType="phone-pad"
                      mask={phoneMask}
                    />

                    {field.state.meta.errors.length > 0 && (
                      <Text className="font-secondary-regular text-error text-[0.5rem]">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </View>
                )}
              </multiStepContext.form.Field>
              <multiStepContext.form.Field
                name="communication.localization"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "O CEP é obrigatório";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <MaskInputWithLabel
                      defaultValue={undefined}
                      value={field.state.value}
                      onChangeText={(_, value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      label="CEP"
                      placeholder="XXXXX-XXX"
                      inputMode="numeric"
                      mask={cepMask}
                    />

                    {field.state.meta.errors.length > 0 && (
                      <Text className="font-secondary-regular text-error text-[0.5rem]">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </View>
                )}
              </multiStepContext.form.Field>
              <View className="w-full flex items-center justify-center">
                <TouchableOpacity
                  className={`min-h-12 w-full m-2 flex flex-row items-center justify-center bg-white border border-secondary-max gap-0.5 rounded-xl`}
                  onPress={multiStepContext.previous}
                >
                  <Text className="text-secondary-max">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!group.state.meta.canSubmit}
                  className={`min-h-12 w-full m-2 flex flex-row items-center justify-center ${group.state.meta.canSubmit ? "bg-primary-min" : "bg-gray-300"} gap-0.5 rounded-xl`}
                  onPress={group.handleSubmit}
                >
                  <Text className="text-white">Avançar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }}
    </multiStepContext.form.FormGroup>
  );
}
