import { UserColorGenerator } from "@/shared/user-color-generator";
import { View, Text, TouchableOpacity } from "react-native";

interface EmployeesCardProps {
  id: number;
  fullname: string;
  onPress?: VoidFunction;
}

export default function EmployeesCard(props: EmployeesCardProps) {
  const reachedFullname = props.fullname.split(" ");
  const initials =
    reachedFullname[0][0].toUpperCase() +
    (reachedFullname[1]?.[0] ?? "").toUpperCase();
  const avatarColor = UserColorGenerator.generate(props.id);

  return (
    <TouchableOpacity
      activeOpacity={props.onPress ? 0.5 : 1}
      onPress={props.onPress}
    >
      <View
        style={{
          overflow: "hidden",
          borderRadius: 16,
          backgroundColor: "white",
          elevation: 3,
        }}
      >
        <View
          style={{
            height: 110,
            justifyContent: "flex-end",
            padding: 16,
            backgroundColor: avatarColor,
          }}
        ></View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#e5eee9",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              {initials}
            </Text>
          </View>
          <Text style={{ color: "#222", fontSize: 16, fontWeight: "600" }}>
            {props.fullname || "Profissional"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
