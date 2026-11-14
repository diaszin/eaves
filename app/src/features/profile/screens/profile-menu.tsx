import { Stack, useRouter } from "expo-router";
import {
  MdCardMembership,
  MdContactSupport,
  MdExitToApp,
  MdLockReset,
  MdNotificationsActive,
  MdOutlineDoorBack,
  MdPermIdentity,
  MdPolicy,
} from "react-icons/md";
import { View, Text, TouchableOpacity } from "react-native";
import ProfileMenuItem from "../components/profile-menu-item";
import { useQuery } from "@tanstack/react-query";
import authService from "@/features/auth/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
export default function ProfileMenuScreen() {
  const session = useSession();
  const router = useRouter();

  const userProfileQuery = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => authService.getProfile(),
  });

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Dados do perfil",
          headerShown: true,
        }}
      />
      <View className="flex items-center justify-center m-4">
        {userProfileQuery.data && (
          <View className="shadow rounded-lg bg-white  border-gray-700 flex flex-col items-center justify-center gap-2 w-full h-40">
            <View className="flex flex-col items-center justify-center">
              <Text className="font-primary-bold text-[1.7rem] leading-8">
                {userProfileQuery.data.profile.fullname}
              </Text>
              <Text className="font-primary-semibold text-customgray leading-8">
                {userProfileQuery.data.email}
              </Text>
            </View>
            <View className="flex flex-col items-center justify-center py-1 px-4 rounded-md border-gray-700 border-[0.5px] bg-secondary-min">
              <Text className="text-secondary-max font-primary-bold leading-8">
                {userProfileQuery.data.role == "patient" && "Paciente"}
              </Text>
            </View>
          </View>
        )}
        <View className="flex flex-col my-4 justify-start w-full gap-4">
          <View className="flex flex-col gap-2">
            <Text className="text-[1.2rem]">Minha conta</Text>
            <View className="flex flex-col gap-1">
              <ProfileMenuItem
                icon={MdPermIdentity}
                title="Dados pessoais"
                subtitle="Nome, telefone e documento"
                onPress={() => {
                  router.push("/(app)/(authenticated)/profile/change");
                }}
              />
              <ProfileMenuItem
                icon={MdLockReset}
                title="Segurança e Senha"
                subtitle="Alteração de senha"
                onPress={() => {
                  router.push("/(app)/(authenticated)/profile/change-password");
                }}
              />
            </View>
          </View>
          <View className="flex flex-col gap-2">
            <Text className="text-[1.2rem]">Preferências do App</Text>
            <View className="flex flex-col gap-1">
              <ProfileMenuItem
                icon={MdNotificationsActive}
                title="Notificações Push"
                subtitle="Para lembretes e novas funcionalidades"
                onPress={() => {}}
              />
            </View>
          </View>
          <View className="flex flex-col gap-2">
            <Text className="text-[1.2rem]">Suporte & Sobre</Text>
            <View className="flex flex-col gap-1">
              <ProfileMenuItem
                icon={MdContactSupport}
                title="Central de Ajuda & FAQ "
                onPress={() => {}}
              />
              <ProfileMenuItem
                icon={MdPolicy}
                title="Termos & Política de Privacidade"
                onPress={() => router.push("/legal_terms")}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              session.signOut();
            }}
            className="bg-red-500 w-full h-10 flex flex-row items-center justify-center gap-1"
          >
            <MdExitToApp className="text-white" />
            <Text className="text-white font-primary-bold">Sair do App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
