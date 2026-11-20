import { useIsFocused } from "expo-router";
import { useEffect, useRef, type ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import {
  notifyScreenFocused,
  useViewTransitionActive,
} from "./view-transition";

const FADE_DELAY_MS = 60;
const FADE_DURATION_MS = 250;
/** Cargas nos primeiros instantes são a abertura do app: sem esmaecimento. */
const INITIAL_LOAD_WINDOW_MS = 1000;
let initialLoadDone = false;
setTimeout(() => {
  initialLoadDone = true;
}, INITIAL_LOAD_WINDOW_MS);

/**
 * Fade through na web: a tela anterior some de imediato (a pilha a oculta) e a
 * nova esmaece de 0 a 1 ao ganhar foco. Desligado com "reduzir movimento" ou
 * durante uma view transition (Hero), para não haver fade duplo.
 */
export default function ScreenFade({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const viewTransitionActive = useViewTransitionActive();
  const shouldAnimate = () =>
    !reduceMotion &&
    !viewTransitionActive &&
    initialLoadDone;

  const opacity = useSharedValue(shouldAnimate() && focused ? 0 : 1);
  const wasFocused = useRef(false);

  useEffect(() => {
    if (focused && !wasFocused.current) {
      notifyScreenFocused();
      if (shouldAnimate()) {
        opacity.value = 0;
        opacity.value = withDelay(
          FADE_DELAY_MS,
          withTiming(1, { duration: FADE_DURATION_MS }),
        );
      } else {
        opacity.value = 1;
      }
    }
    wasFocused.current = focused;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
}
