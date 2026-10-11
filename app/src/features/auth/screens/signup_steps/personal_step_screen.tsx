import { TouchableOpacity, View, Text } from "react-native";
import { useContext } from "react";

import InputWithLabel from "../../components/input_with_label";
import { CustomDateTimePicker } from "../../components/datetime_picker/datetime_picker.web";
import MaskInputWithLabel from "../../components/masked_input_with_label";
import { Masks } from "react-native-mask-input";
import { cpf } from "cpf-cnpj-validator";
import { MultiStepContext } from "../../contexts/multiStepContext";
import DropdownWithLabel from "../../components/dropdown_with_label";

export default function PersonalStep() {
  const multiStepContext = useContext(MultiStepContext);
  const cpfMask = Masks.BRL_CPF;

  const raceOptions = [
    {
      label: "Preta",
      value: "preta",
    },
    {
      label: "Parda",
      value: "parda",
    },
    {
      label: "Amarela",
      value: "amarela",
    },
    {
      label: "Indígena",
      value: "indigena",
    },
    {
      label: "Branca",
      value: "branca",
    },
    {
      label: "Prefiro não informar",
      value: "nenhuma",
    },
  ];

  const incomeBraketOptions = [
    {
      label: "Até 2 salários mínimos ",
      value: "ate-2-salarios-minimos",
    },
    {
      label: "de 2 a 5 salários mínimos",
      value: "de-2-a-5-salarios-minimos",
    },
    {
      label: "Mais de 5 salários mínimos",
      value: "mais-de-5",
    },
    {
      label: "Mais de 10 salários mínimos",
      value: "mais-de-10",
    },
    {
      label: "Mais de 10 a 20 salários mínimos",
      value: "mais-de-10-a-20",
    },
    {
      label: "Mais de 20 salários mínimos",
      value: "mais-de-20",
    },
    {
      label: "Sem rendimento",
      value: "sem-rendimento",
    },
  ];

  if (!multiStepContext) {
    throw new Error("useContext deve ser usado dentro de um MultiStepProvider");
  }

  return (
    <multiStepContext.form.FormGroup
      name="personal"
      onGroupSubmit={() => multiStepContext.next()}
      defaultValue={{
        ...multiStepContext.form.state.values.personal,
        incomeBraket: incomeBraketOptions[0].value,
        race: raceOptions[0].value,
      }}
    >
      {(group) => {
        return (
          <View className="w-full">
            <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4 w-full">
              <multiStepContext.form.Field
                name="personal.fullname"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "O nome é obrigatório";
                    }

                    if (value.split(" ").length <= 1) {
                      return "Insira o nome e sobrenome";
                    }
                  },
                }}
              >
                {(field) => (
                  <View>
                    <InputWithLabel
                      defaultValue={field.state.value}
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
              <multiStepContext.form.Field
                name="personal.document"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "CPF é obrigatório";
                    }

                    if (!cpf.isValid(value)) {
                      return "O CPF não é válido";
                    }
                  },
                }}
              >
                {(field) => (
                  <View className="flex flex-col gap-2">
                    <MaskInputWithLabel
                      defaultValue={undefined}
                      value={field.state.value}
                      onChangeText={(maskedValue, value) =>
                        field.handleChange(value)
                      }
                      onBlur={field.handleBlur}
                      label="CPF"
                      placeholder="123.456.789-00"
                      inputMode="numeric"
                      mask={cpfMask}
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
                  onChange: ({ value }) => {
                    const currentDate = new Date(Date.now());
                    const minimumAge = 18;

                    if (!value) {
                      return "Data de nascimento é obrigatória";
                    }

                    if (
                      value.getFullYear() >
                      currentDate.getFullYear() - minimumAge
                    ) {
                      return "É necessário ter pelo menos 18 anos para prosseguir";
                    }

                    return undefined;
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
              <multiStepContext.form.Field
                name="personal.race"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "Esse campo deve ser preenchido";
                    }
                  },
                }}
              >
                {(field) => {
                  return (
                    <DropdownWithLabel
                      label={"Raça"}
                      data={raceOptions}
                      selectedValue={field.state.value || raceOptions[0].value}
                      onValueChange={(value) =>
                        field.handleChange(value.toString())
                      }
                    />
                  );
                }}
              </multiStepContext.form.Field>
              <multiStepContext.form.Field
                name="personal.incomeBraket"
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.trim().length == 0) {
                      return "Esse campo deve ser preenchido";
                    }
                  },
                }}
              >
                {(field) => {
                  return (
                    <DropdownWithLabel
                      label={"Faixa salarial"}
                      data={incomeBraketOptions}
                      selectedValue={
                        field.state.value || incomeBraketOptions[0].value
                      }
                      onValueChange={(value) =>
                        field.handleChange(value.toString())
                      }
                    />
                  );
                }}
              </multiStepContext.form.Field>
              <View className="w-full flex items-center justify-center">
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
