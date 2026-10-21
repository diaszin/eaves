import { useAuth } from "@/hooks/useAuth";
import { Link } from "expo-router";
import { CgChevronRight } from "react-icons/cg";
import { MdSafetyDivider } from "react-icons/md";
import { Text, View } from "react-native";

export default function HomePage() {
  const currentuser = useAuth();

  return (
    <View className="flex flex-col">
      <Link href="/(app)/(authenticated)/surveys/phq" className="m-2">
        <View className="group w-full flex gap-4 border-2 shadow shadow-slate-400 p-4 rounded-sm border-secondary-max active:bg-secondary-min">
          <View className="w-full flex flex-col">
            <Text className="group-active:text-secondary-max text-[1.2rem]">
              Como você está hoje?
            </Text>
            <Text className="group-active:text-secondary-max text-[0.7rem] w-60 text-customgray">
              Clique aqui para realizar a sua avaliação diária! Desabafar faz
              bem
            </Text>
          </View>
          <View className="flex ">
            <View className="h-[0.2rem] bg-primary-min"/>
            
          </View>
        </View>
      </Link>
    </View>
  );
}
