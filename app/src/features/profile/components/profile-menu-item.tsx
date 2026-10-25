import { Href } from "expo-router";
import { IconType } from "react-icons/lib";
import { MdArrowRight, MdChevronRight, MdPermIdentity } from "react-icons/md";
import { View, Text, TouchableOpacity } from "react-native";

interface ProfileMenuItemProps {
  title: string;
  subtitle?: string;
  icon: IconType;
  onPress: VoidFunction;
}

export default function ProfileMenuItem(props: ProfileMenuItemProps) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View className="w-full bg-white p-2 flex flex-row justify-between items-center rounded-md">
        <View className="flex flex-row gap-4 items-center">
          <View className="h-8 w-8 bg-secondary-min text-blue-300 flex items-center justify-center rounded-md">
            <props.icon />
          </View>
          <View className="flex flex-col justify-center">
            <Text className="text-[1rem]">{props.title}</Text>
            {props.subtitle && (
              <Text className="text-customgray text-[0.8rem]">
                {props.subtitle}
              </Text>
            )}
          </View>
        </View>
        <View>
          <MdChevronRight />
        </View>
      </View>
    </TouchableOpacity>
  );
}
