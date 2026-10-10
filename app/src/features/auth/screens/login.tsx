import { View, Text, Image, TouchableOpacity } from "react-native";
import InputWithLabel from "../components/input_with_label";
import {
  MdArrowForward,
  MdArrowRight,
  MdArrowRightAlt,
  MdLockOutline,
  MdOutlineEmail,
  MdOutlineVisibility,
} from "react-icons/md";
import { Link } from "expo-router";
import authService from "../services/auth.service";
import { useState } from "react";

function handleLogin(email: string, password: string) {
  return authService.login({ email, password });
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="bg-secondary-min h-screen p-4">
      <View className="flex flex-col items-center justify-center gap-1">
        <Image
          style={{
            width: 79,
            height: 79,
          }}
          source={require("@/assets/images/icon.png")}
        />
        <Text className="text-3xl text-secondary-max font-primary-bold">
          Bem-vindo de volta
        </Text>
        <Text className="font-secondary-regular text-[0.8rem] text-customblack-min">
          Acesse sua conta e continue cuidando de você.
        </Text>
      </View>
      <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4">
        <InputWithLabel
          onChangeText={(text) => setEmail(text)}
          leading={<MdOutlineEmail className="text-customgray size-6" />}
          label="E-mail"
          keyboardType="email-address"
          inputMode="email"
          placeholder="seuemail@exemplo.com"
        />
        <InputWithLabel
          onChangeText={(text) => setPassword(text)}
          leading={<MdLockOutline className="text-customgray size-6" />}
          label="Senha"
          secureTextEntry={true}
          trailing={<MdOutlineVisibility className="text-customgray size-6" />}
        />
        <View className="flex flex-row items-end justify-end">
          <Link className="text-primary-max" href="/">
            Esqueci minha senha
          </Link>
        </View>

        <TouchableOpacity
          onPress={() => {
            handleLogin(email, password);
          }}
          className="min-h-12 flex flex-row items-center justify-center bg-primary-min gap-0.5 rounded-xl"
        >
          <Text className="text-white">Entrar</Text>
          <MdArrowForward className="text-white size-4" />
        </TouchableOpacity>

        <View className="flex flex-row items-center justify-center">
          <View className="h-0.5 w-20 bg-gray-300" />
          <Text className="px-2 text-customgray">ou continue com</Text>
          <View className="h-0.5 w-20 bg-gray-300" />
        </View>
      </View>
    </View>
  );
}
