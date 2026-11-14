import { useState, useEffect } from "react";
import { Animated, Platform } from "react-native";

const motivationalTexts = [
  "Você é capaz de superar os desafios de hoje.",
  "Cada pequeno passo também é progresso.",
  "Cuide de você: seu bem-estar importa.",
  "Acredite no caminho que está construindo.",
];

export default function MotivationalText() {
  const [index, setIndex] = useState(0);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
      setIndex((current) => (current + 1) % motivationalTexts.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.Text style={{ opacity, fontSize: 12, color: "gray" }}>
      {motivationalTexts[index]}
    </Animated.Text>
  );
}
