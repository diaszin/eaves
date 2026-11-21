import PressableScale from "@/shared/components/pressable-scale";
import appointmentService from "@/features/appointments/services/appointment.service";
import type { Appointment } from "@/features/appointments/services/appointment.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdNaturePeople } from "react-icons/md";
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

const ENTRANCE_DURATION_MS = 250;
const ENTRANCE_STAGGER_MS = 70;
const ENTRANCE_OFFSET = 10;

type EntranceState = "pending" | "animate" | "static";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  cancelled: "Cancelado",
};

function getErrorMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) return message.join(" ");

  return (
    message ?? "Não foi possível cancelar o agendamento. Tente novamente."
  );
}

function AppointmentItem({
  item,
  index,
  entranceState,
  onMeasureRef,
  onLayout,
  onEntranceStart,
}: {
  item: Appointment;
  index: number;
  entranceState: EntranceState;
  onMeasureRef: (id: number, view: View | null) => void;
  onLayout: () => void;
  onEntranceStart: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const reduceMotion = useReducedMotion();
  const entering = useMemo(
    () =>
      FadeInDown.duration(ENTRANCE_DURATION_MS)
        .delay(index * ENTRANCE_STAGGER_MS)
        .withInitialValues({ translateY: ENTRANCE_OFFSET }),
    [index],
  );
  const measureRef = useCallback(
    (view: View | null) => onMeasureRef(item.id, view),
    [item.id, onMeasureRef],
  );

  useLayoutEffect(() => {
    if (entranceState === "animate" && !reduceMotion) {
      onEntranceStart(item.id);
    }
  }, [entranceState, item.id, onEntranceStart, reduceMotion]);

  const cancelMutation = useMutation({
    mutationKey: ["appointments", "cancel", item.id],
    mutationFn: () => appointmentService.cancel(item.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setConfirming(false);
    },
  });

  const initialDate = new Date(item.initialDate);
  const endDate = new Date(item.endDate);

  const status = item.status ?? "scheduled";
  const isCancelled = status === "cancelled";
  const hasEnded = endDate.getTime() <= Date.now();
  const canCancel = !isCancelled && !hasEnded;

  const isToday = initialDate.toDateString() === new Date().toDateString();

  const weekday = initialDate
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
  const month = initialDate
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const formattedDate = `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${initialDate.getDate()} ${month[0].toUpperCase()}${month.slice(1)}`;

  const initialDateHour = `${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}`;

  const endDateHour = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

  const card = (
    <View
      ref={measureRef}
      onLayout={onLayout}
      className="bg-white flex flex-col gap-2 p-2"
    >
        <View className="flex flex-row items-center gap-2">
          <View className="bg-blue-100 flex items-center justify-center size-10 rounded-full">
            <MdNaturePeople className="text-primary-max" size={25} />
          </View>
          <View className="flex flex-col gap-1 flex-1">
            <Text className={isCancelled ? "line-through text-gray-500" : ""}>
              {item.professional.profile.fullname}
            </Text>
            <View className="flex flex-row bg-blue-100 rounded-md p-1 self-start">
              <Text className="font-secondary-medium text-primary-max text-[0.7rem]">
                {isToday ? "Hoje" : formattedDate} • {initialDateHour} às{" "}
                {endDateHour}
              </Text>
            </View>
          </View>
          <View
            className={
              isCancelled
                ? "bg-red-100 rounded-md px-2 py-1"
                : "bg-green-100 rounded-md px-2 py-1"
            }
          >
            <Text
              className={
                isCancelled
                  ? "text-red-700 text-[0.7rem]"
                  : "text-green-700 text-[0.7rem]"
              }
            >
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
        </View>

        {canCancel &&
          (confirming ? (
            <View className="flex flex-col gap-2 bg-red-50 rounded-md p-2">
              <Text className="text-red-700 text-[0.8rem]">
                Tem certeza que deseja cancelar este agendamento? Essa ação não
                pode ser desfeita.
              </Text>
              <View className="flex flex-row gap-2">
                <PressableScale
                  accessibilityRole="button"
                  disabled={cancelMutation.isPending}
                  onPress={() => cancelMutation.mutate()}
                  className="bg-red-600 rounded-md px-3 py-2"
                >
                  <Text className="text-white text-[0.8rem]">
                    {cancelMutation.isPending
                      ? "Cancelando..."
                      : "Confirmar cancelamento"}
                  </Text>
                </PressableScale>
                <PressableScale
                  accessibilityRole="button"
                  disabled={cancelMutation.isPending}
                  onPress={() => {
                    cancelMutation.reset();
                    setConfirming(false);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <Text className="text-[0.8rem]">Voltar</Text>
                </PressableScale>
              </View>
              {cancelMutation.isError && (
                <Text className="text-red-700 text-[0.8rem]">
                  {getErrorMessage(cancelMutation.error)}
                </Text>
              )}
            </View>
          ) : (
            <PressableScale
              accessibilityRole="button"
              onPress={() => setConfirming(true)}
              className="self-start border border-red-600 rounded-md px-3 py-2"
            >
              <Text className="text-red-600 text-[0.8rem]">Cancelar</Text>
            </PressableScale>
          ))}
    </View>
  );

  if (entranceState === "animate" && !reduceMotion) {
    return (
      <Animated.View
        entering={entering}
        style={{ width: "100%", alignSelf: "stretch", flexShrink: 0 }}
      >
        {card}
      </Animated.View>
    );
  }

  const pendingStyle = {
    width: "100%" as const,
    alignSelf: "stretch" as const,
    flexShrink: 0,
    ...(entranceState === "pending" && !reduceMotion ? { opacity: 0 } : {}),
  };

  return <View style={pendingStyle}>{card}</View>;
}

export default function GetRecentlyAppointments() {
  const { height: windowHeight } = useWindowDimensions();
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "view"],
    queryFn: () => appointmentService.get(),
  });
  const appointmentViews = useRef(new Map<number, View>());
  const startedEntranceIds = useRef(new Set<number>());
  const captureScheduled = useRef(false);
  const hasCapturedInitialViewport = useRef(false);
  const [initialViewportIds, setInitialViewportIds] =
    useState<Set<number> | null>(null);

  const registerAppointmentView = useCallback(
    (id: number, view: View | null) => {
      if (view) {
        appointmentViews.current.set(id, view);
      } else {
        appointmentViews.current.delete(id);
      }
    },
    [],
  );

  const markEntranceStarted = useCallback((id: number) => {
    startedEntranceIds.current.add(id);
  }, []);

  const captureInitialViewport = useCallback(() => {
    if (
      hasCapturedInitialViewport.current ||
      captureScheduled.current
    ) {
      return;
    }

    captureScheduled.current = true;
    requestAnimationFrame(() => {
      const rows = Array.from(appointmentViews.current.entries());
      if (rows.length === 0) {
        captureScheduled.current = false;
        return;
      }

      const visibleIds = new Set<number>();
      let remaining = rows.length;

      rows.forEach(([id, view]) => {
        view.measureInWindow((_x, y, _width, height) => {
          if (y < windowHeight && y + height > 0) {
            visibleIds.add(id);
          }

          remaining -= 1;
          if (remaining === 0) {
            hasCapturedInitialViewport.current = true;
            setInitialViewportIds(visibleIds);
          }
        });
      });
    });
  }, [windowHeight]);

  if (appointmentsQuery.isLoading) {
    return null;
  }

  if (!appointmentsQuery.data) {
    return (
      <View>
        <Text>Nenhum agendamento</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="font-primary-bold text-[1.2rem]">Seus agendamentos</Text>
      <FlatList
        data={appointmentsQuery.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="flex flex-col gap-2"
        onContentSizeChange={captureInitialViewport}
        renderItem={({ item, index }) => (
          <AppointmentItem
            item={item}
            index={index}
            entranceState={
              initialViewportIds === null
                ? "pending"
                : initialViewportIds.has(item.id) &&
                    !startedEntranceIds.current.has(item.id)
                  ? "animate"
                  : "static"
            }
            onMeasureRef={registerAppointmentView}
            onLayout={captureInitialViewport}
            onEntranceStart={markEntranceStarted}
          />
        )}
      />
    </View>
  );
}
