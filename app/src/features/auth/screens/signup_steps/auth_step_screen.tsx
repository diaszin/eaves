import { TouchableOpacity, View, Text } from "react-native";
import { useContext } from "react";
import MaskInputWithLabel from "../../components/masked_input_with_label";
import { MultiStepContext } from "../../contexts/multiStepContext";
import InputWithLabel from "../../components/input_with_label";
import { CgSpinner } from "react-icons/cg";

export default function AuthStepScreen() {
  const multiStepContext = useContext(MultiStepContext);

  if (!multiStepContext) {
    throw new Error("useContext deve ser usado dentro de um MultiStepProvider");
  }

  return (
    <multiStepContext.form.FormGroup
      name="auth"
      onGroupSubmit={() => multiStepContext.form.handleSubmit()}
    >
      {(group) => {
        return (
          <View className="w-full">
            <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4 w-full">
              <multiStepContext.form.Field
                name="auth.email"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "O e-mail é obrigatório";
                    }

                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return "Informe um e-mail válido";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <InputWithLabel
                      disabled={field.state.value.length > 0}
                      value={field.state.value}
                      onChangeText={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      label="E-mail"
                      placeholder="seuemail@exemplo.com"
                      inputMode="email"
                      keyboardType="email-address"
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
                name="auth.password"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "A senha é obrigatória";
                    }

                    if (value.length < 8) {
                      return "A senha deve ter no mínimo 8 caracteres";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <InputWithLabel
                      onChangeText={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      label="Senha"
                      inputMode="text"
                      secureTextEntry={true}
                      keyboardType="visible-password"
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
                name="auth.confirmPassword"
                validators={{
                  onBlur: ({ value }) => {
                    const password =
                      multiStepContext.form.getFieldValue("auth.password");

                    if (value !== password) {
                      return "As senhas não coincidem";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <InputWithLabel
                      onChangeText={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      label="Confirme sua senha"
                      inputMode="text"
                      secureTextEntry={true}
                      keyboardType="visible-password"
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
                  disabled={
                    !group.state.meta.canSubmit ||
                    multiStepContext.form.state.isSubmitting
                  }
                  className={`min-h-12 w-full m-2 flex flex-row items-center justify-center ${group.state.meta.canSubmit && !multiStepContext.form.state.isSubmitting ? "bg-primary-min" : "bg-gray-300"} gap-0.5 rounded-xl`}
                  onPress={group.handleSubmit}
                >
                  {!multiStepContext.form.state.isSubmitting ? (
                    <Text className="text-white">Criar minha conta</Text>
                  ) : (
                    <CgSpinner className="text-white size-4 animate-spin" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }}
    </multiStepContext.form.FormGroup>
  );
}
