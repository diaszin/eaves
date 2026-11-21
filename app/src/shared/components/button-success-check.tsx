import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef } from "react";

/** Tempo máximo de espera pelo fim da animação (dura ~2,33 s). */
const FINISH_TIMEOUT_MS = 3500;

type ButtonSuccessCheckProps = {
  /** Chamado uma única vez: fim da animação ou tempo limite. */
  onFinish: () => void;
  /** Lado da caixa da animação, em px. */
  size?: number;
};

/**
 * Animação de check de sucesso para ser exibida dentro de um botão.
 * Toca uma vez e avisa o término; se o evento não vier, avisa pelo tempo limite.
 */
export default function ButtonSuccessCheck({
  onFinish,
  size = 40,
}: ButtonSuccessCheckProps) {
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const finish = useCallback(() => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    onFinishRef.current();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(finish, FINISH_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [finish]);

  return (
    <LottieView
      source={require("../../../assets/animations/json/check-mark.json")}
      autoPlay
      loop={false}
      style={{ width: size, height: size }}
      onAnimationFinish={(isCancelled) => {
        if (!isCancelled) {
          finish();
        }
      }}
      onAnimationFailure={finish}
    />
  );
}
