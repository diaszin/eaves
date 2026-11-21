import { cssInterop } from "nativewind";
import { useCallback, useEffect } from "react";
import {
  Platform,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type PressableScaleSize = "button" | "card" | "icon";

/** Intensidade da microinteração por tamanho do elemento (data-model.md). */
const PRESETS: Record<PressableScaleSize, { scale: number; opacity: number }> =
  {
    button: { scale: 0.97, opacity: 0.9 },
    card: { scale: 0.985, opacity: 0.92 },
    icon: { scale: 0.9, opacity: 0.85 },
  };

const REDUCED_MOTION_PRESSED_OPACITY = 0.7;
const HOVER_OPACITY = 0.95;
const DISABLED_OPACITY = 0.7;
const PRESS_IN_MS = 90;
const STATE_MS = 180;
const SELECT_MS = 150;
const RELEASE_SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: "style" });

/** Cores [não selecionado, selecionado] animadas quando `selected` muda. */
export type SelectedColors = {
  backgroundColor?: readonly [string, string];
  borderColor?: readonly [string, string];
};

type HoverEvent = Parameters<NonNullable<PressableProps["onHoverIn"]>>[0];

export type PressableScaleProps = Omit<PressableProps, "children" | "style"> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Define a intensidade do feedback. Padrão: `button`. */
  size?: PressableScaleSize;
  /** Estado de seleção (seletores). Usado com `selectedColors`. */
  selected?: boolean;
  /** Cores animadas entre os estados não selecionado e selecionado. */
  selectedColors?: SelectedColors;
  children?: React.ReactNode;
};

/**
 * Elemento tocável com microinteração padrão: reduz levemente de escala ao
 * pressionar, volta suavemente ao soltar, reage ao hover na web e suaviza o
 * estado desabilitado. Com "reduzir movimento" ativo, usa só opacidade.
 */
export default function PressableScale({
  size = "button",
  selected,
  selectedColors,
  disabled,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const preset = PRESETS[size];

  const pressed = useSharedValue(0);
  const hovered = useSharedValue(0);
  const dimmed = useSharedValue(disabled ? 1 : 0);
  const selection = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selection.set(withTiming(selected ? 1 : 0, { duration: SELECT_MS }));
  }, [selected, selection]);

  useEffect(() => {
    dimmed.set(withTiming(disabled ? 1 : 0, { duration: STATE_MS }));
    if (disabled) {
      pressed.set(0);
      hovered.set(0);
    }
  }, [disabled, dimmed, pressed, hovered]);

  const animatedStyle = useAnimatedStyle(() => {
    const pressedOpacity = reduceMotion
      ? REDUCED_MOTION_PRESSED_OPACITY
      : preset.opacity;
    const scale = reduceMotion ? 1 : 1 - pressed.value * (1 - preset.scale);
    const base =
      1 -
      hovered.value * (1 - HOVER_OPACITY) -
      pressed.value * (1 - pressedOpacity);
    const opacity = base * (1 - dimmed.value * (1 - DISABLED_OPACITY));

    const style: {
      opacity: number;
      transform: { scale: number }[];
      backgroundColor?: string;
      borderColor?: string;
    } = { opacity, transform: [{ scale }] };

    if (selectedColors?.backgroundColor) {
      style.backgroundColor = interpolateColor(
        selection.value,
        [0, 1],
        [...selectedColors.backgroundColor],
      );
    }
    if (selectedColors?.borderColor) {
      style.borderColor = interpolateColor(
        selection.value,
        [0, 1],
        [...selectedColors.borderColor],
      );
    }

    return style;
  });

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      pressed.set(withTiming(1, { duration: PRESS_IN_MS }));
      onPressIn?.(event);
    },
    [onPressIn, pressed],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      pressed.set(
        reduceMotion
          ? withTiming(0, { duration: STATE_MS })
          : withSpring(0, RELEASE_SPRING),
      );
      onPressOut?.(event);
    },
    [onPressOut, pressed, reduceMotion],
  );

  const handleHoverIn = useCallback(
    (event: HoverEvent) => {
      hovered.set(withTiming(1, { duration: STATE_MS }));
      onHoverIn?.(event);
    },
    [onHoverIn, hovered],
  );

  const handleHoverOut = useCallback(
    (event: HoverEvent) => {
      hovered.set(withTiming(0, { duration: STATE_MS }));
      onHoverOut?.(event);
    },
    [onHoverOut, hovered],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={Platform.OS === "web" ? handleHoverIn : onHoverIn}
      onHoverOut={Platform.OS === "web" ? handleHoverOut : onHoverOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
