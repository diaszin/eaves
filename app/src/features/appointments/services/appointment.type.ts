export interface CalendarPeriod {
	id: number;
	dayOfWeek: number;
	customDate: string | null;
	startTime: string;
	endTime: string;
	location: string;
	notes: string;
	maxCapacity: number;
}

export interface CreateAppointmentRequest {
	initialDate: string;
	professionalId: number;
}
