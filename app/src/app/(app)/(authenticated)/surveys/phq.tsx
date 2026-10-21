import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import PHQScreen from "@/features/surveys/screens/phq";
import surveyService from "@/features/surveys/services/survey.service";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundaryProps, Stack, useRouter } from "expo-router";

export default PHQScreen;

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  return (
    <ErrorBottomSheet
      error={error}
      onDismiss={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}
