import { UserColorGenerator } from "@/shared/user-color-generator";
import { useLayoutEffect, useRef } from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { useProfessionalSharedTag } from "@/shared/navigation/transitions";
import { useProfessionalTransitionName } from "@/shared/navigation/view-transition";

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
  const sharedTransitionTag = useProfessionalSharedTag(props.id);

  // Web: nome da view transition (Hero) aplicado ao DOM antes da captura.
  const transitionName = useProfessionalTransitionName(props.id);
  const wrapperRef = useRef<View>(null);
  useLayoutEffect(() => {
    const element = wrapperRef.current as unknown as HTMLElement | null;
    if (element?.style) {
      element.style.setProperty("view-transition-name", transitionName ?? "");
    }
  }, [transitionName]);

  const card = (
    <Animated.View
      sharedTransitionTag={sharedTransitionTag}
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
    </Animated.View>
  );

  return (
    <TouchableOpacity
      activeOpacity={props.onPress ? 0.5 : 1}
      onPress={props.onPress}
    >
      {/* O envoltório com ref existe só na web (Hero); no móvel a árvore não muda. */}
      {Platform.OS === "web" ? <View ref={wrapperRef}>{card}</View> : card}
    </TouchableOpacity>
  );
}
