import { TouchableOpacity, View, Text } from "react-native";
import { useContext } from "react";
import { MultiStepContext } from "../signup";
import InputWithLabel from "../../components/input_with_label";
import { CustomDateTimePicker } from "../../components/datetime_picker/datetime_picker.web";

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
          <View className="w-full">
            <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4 w-full">
              <multiStepContext.form.Field name="personal.fullname">
                {(field) => (
                  <View>
                    <InputWithLabel
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      onBlur={field.handleBlur}
                      label="Nome completo"
                      placeholder="Leonardo Di Caprio"
                      inputMode="text"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text className="font-secondary-regular text-error text-[0.5rem]">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </View>
                )}
              </multiStepContext.form.Field>
              <multiStepContext.form.Field name="personal.document">
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <InputWithLabel
                      value={field.state.value}
                      onChangeText={(text) => field.handleChange(text)}
                      onBlur={field.handleBlur}
                      label="CPF"
                      placeholder="123.456.789-00"
                      inputMode="text"
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
                name="personal.birthDate"
                validators={{
                  onChange: ({value}) => {
                    const currentDate = new Date(Date.now())
                    const minimumAge = 18

                    if(value.getFullYear() > (currentDate.getFullYear() - minimumAge)){
                      return "É necessário ter pelo menos 18 anos para prosseguir"
                    }

                    return undefined
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <CustomDateTimePicker
                      label="Data de nascimento"
                      value={field.state.value}
                      onChange={(date) => {
                        field.handleChange(date);
                      }}
                    />

                    {field.state.meta.errors.length > 0 && (
                      <Text className="font-secondary-regular text-error text-[0.5rem]">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </View>
                )}
              </multiStepContext.form.Field>
            </View>
            <TouchableOpacity className="w-full" onPress={group.handleSubmit}>
              <Text>Funcionou</Text>
            </TouchableOpacity>
          </View>
        );
      }}
    </multiStepContext.form.FormGroup>
  );
}
