import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Save, Settings } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/auth";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { LoadingSpinner } from "@/shared/components/ui/LoadingSpinner";
import { generalSettingsService } from "@/features/settings/services/general-settings.service";

const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 1440;
const SETTINGS_QUERY_KEY = ["general-settings"];

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }

  return error instanceof Error
    ? error.message
    : "Não foi possível salvar as configurações.";
}

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState("");

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: generalSettingsService.get,
    enabled: user?.role === "coordinator",
  });

  const updateMutation = useMutation({
    mutationFn: generalSettingsService.update,
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setDuration(String(settingsQuery.data.therapySessionDurationMinutes));
    }
  }, [settingsQuery.data]);

  if (user?.role !== "coordinator") {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minutes = Number(duration);
    if (
      Number.isInteger(minutes) &&
      minutes >= MIN_DURATION_MINUTES &&
      minutes <= MAX_DURATION_MINUTES
    ) {
      updateMutation.mutate(minutes);
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Configuração geral
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Gerencie as configurações padrão da plataforma.
        </p>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <section className="max-w-3xl rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-slate-100 p-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Sessões de terapia
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Defina a duração aplicada automaticamente aos novos
                agendamentos.
              </p>
            </div>
          </div>

          <div className="p-6">
            {settingsQuery.isLoading ? (
              <LoadingSpinner />
            ) : settingsQuery.isError ? (
              <p role="alert" className="text-sm text-red-700">
                Erro ao carregar configurações:{" "}
                {getErrorMessage(settingsQuery.error)}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-sm">
                <Input
                  label="Duração da sessão"
                  type="number"
                  min={MIN_DURATION_MINUTES}
                  max={MAX_DURATION_MINUTES}
                  step={1}
                  required
                  value={duration}
                  onChange={(event) => {
                    setDuration(event.target.value);
                    updateMutation.reset();
                  }}
                  helperText="Informe o tempo em minutos (de 1 a 1440)."
                />
                <div className="mt-5 flex items-center gap-3">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={updateMutation.isPending}
                    disabled={!duration}
                  >
                    <Save className="h-4 w-4" />
                    Salvar configuração
                  </Button>
                  {updateMutation.isSuccess && (
                    <span role="status" className="text-sm text-green-700">
                      Configuração salva.
                    </span>
                  )}
                </div>
                {updateMutation.isError && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    Erro ao salvar: {getErrorMessage(updateMutation.error)}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        <div className="mt-5 flex max-w-3xl items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />A duração configurada será usada no
          cálculo do horário de término dos novos agendamentos.
        </div>
      </main>
    </div>
  );
}
