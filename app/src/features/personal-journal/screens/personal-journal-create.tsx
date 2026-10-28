import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import personalJournalService from "../services/personal-journal.service";
import EmotionButton from "../components/emotion-button";
import { MdLightbulb } from "react-icons/md";
import { router, Stack } from "expo-router";
import { useForm } from "@tanstack/react-form";
import { CreatePersonalJournalRequest } from "../services/personal-journal.type";
import { AxiosError } from "axios";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
export default function PersonalJournalCreate() {
  const currentDate = new Date();
  const currentDateFormat = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Bahia",
    day: "2-digit",
  });

  const namedCurrentDate = currentDateFormat.format(currentDate);

  const queryClient = useQueryClient();
  const getEmotionsQuery = useQuery({
    queryKey: ["emotions", "category"],
    queryFn: () => personalJournalService.getEmotions(),
  });

  const createMutation = useMutation<
    any,
    AxiosError,
    CreatePersonalJournalRequest
  >({
    mutationKey: ["personal-journal", "create"],
    mutationFn: (data) => personalJournalService.create(data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["personal-journal", "view"],
      });
    },
  });

  const createForm = useForm({
    defaultValues: {} as CreatePersonalJournalRequest,
    onSubmit: async ({ value }) => {
      createMutation.mutate(value);
    },
  });

  return (
    <SafeAreaView className="flex flex-col mx-4 my-8 gap-4">
      <Stack.Screen
        options={{
          title: "Minha memória",
          headerShown: true,
        }}
      />
      <View className="flex flex-col gap-2">
        <Text className="font-secondary-semibold text-secondary-max">
          Hoje, {namedCurrentDate}
        </Text>
        <Text className="font-primary-bold text-customblack-max text-[1.4rem]">
          Esse aqui é o seu espaço seguro
        </Text>
        <Text className="font-secondary-regular text-customgray text-[0.8rem]">
          Respire fundo. Não há julgamentos aqui, apenas você e seus
          sentimentos.
        </Text>
      </View>
      <View className="bg-secondary-min p-4 flex flex-col gap-2">
        <Text className="font-secondary-semibold text-customblack-max w-38 text-lg">
          Como está seu clima interior?
        </Text>
        <createForm.Field
          validators={{
            onBlur({ value }) {
              if (!value) {
                return "Uma emoção deve ser escolhida";
              }
            },
          }}
          name="emotion"
        >
          {(field) => (
            <View onBlur={field.handleBlur}>
              <FlatList
                contentContainerStyle={{ gap: 8, height: 30 }}
                data={getEmotionsQuery.data}
                renderItem={({ item }) => (
                  <EmotionButton
                    active={item.id === field.state.value}
                    value={item.id}
                    onPress={(value) => field.handleChange(value)}
                    content={item.emotion.toUpperCase()}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-secondary-regular text-error text-[0.5rem]">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </createForm.Field>
      </View>
      <View>
        <View className="bg-secondary-min flex flex-col justify-start gap-2  p-5">
          <View className="flex flex-row items-center gap-1">
            <MdLightbulb className="text-secondary-max" />
            <Text className="text-secondary-max font-secondary-semibold">
              Ponto de Partida
            </Text>
          </View>
          <View>
            <Text className="text-secondary-max font-secondary font-light ">
              "O que pesou no seu peito hoje e o que você gostaria de
              gentilmente deixar ir embora agora?"
            </Text>
          </View>
        </View>
      </View>
      <View className="h-full">
        <createForm.Field
          validators={{
            onChange({ value }) {
              if (!value || value.trim().length == 0) {
                return "Esse campo é obrigatório";
              }
            },
          }}
          name="content"
        >
          {(field) => (
            <View className="h-full">
              <TextInput
                onBlur={field.handleBlur}
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder="Escreva sem filtros nem regras. Solte seus pensamentos, conte sobre o seu dia ou simplesmente desabafe o que está aí dentro..."
                multiline
                autoFocus
                style={{
                  fontSize: 15,
                }}
                className="p-2 outline-none rounded-md shadow bg-white h-full placeholder:text-[1.5rem] placeholder:font-secondary-semibold"
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-secondary-regular text-error text-[0.5rem]">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </createForm.Field>
      </View>
      <createForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <TouchableOpacity
            disabled={!canSubmit || isSubmitting}
            className={
              !canSubmit
                ? "w-full bg-customgray rounded-md"
                : "w-full bg-primary-min rounded-md"
            }
            onPress={() => createForm.handleSubmit()}
          >
            <Text className="text-center font-primary-bold text-white py-4">
              Desabafar{" "}
            </Text>
          </TouchableOpacity>
        )}
      </createForm.Subscribe>
      {createMutation.isError && (
        <ErrorBottomSheet
          error={createMutation.error}
          onDismiss={() => router.back()}
        />
      )}
      {createMutation.isSuccess && (
        <SuccessBottomSheet
          isOpen={createForm.state.isSubmitSuccessful}
          messsage={"Desabafo registrado"}
          onDismiss={() => router.back()}
        />
      )}
    </SafeAreaView>
  );
}

function BottomSheet({
  title,
  message,
  onClose,
  isError = false,
}: {
  title: string;
  message: string;
  onClose: () => void;
  isError?: boolean;
}) {
  return (
    <View className="absolute inset-0 justify-end bg-black/40">
      <View className="gap-3 rounded-t-2xl bg-white p-6">
        <Text
          className={`font-primary-bold text-lg ${isError ? "text-error" : "text-secondary-max"}`}
        >
          {title}
        </Text>
        <Text className="font-secondary-regular text-customblack-max">
          {message}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onClose}
          className="w-full rounded-md bg-primary-min"
        >
          <Text className="py-4 text-center font-primary-bold text-white">
            Fechar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
