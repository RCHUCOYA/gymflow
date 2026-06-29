import { apiClient } from "@/lib/api-client";

export type Professional = {
  id: string;
  type: "trainer" | "nutritionist";
  specialty: string | null;
  bio: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
};

export type Appointment = {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  professional: {
    id: string;
    type: string;
    user: { id: string; firstName: string; lastName: string };
  };
  createdAt: string;
  trainingProgress?: Array<{
    id: string;
    notes: string;
    metrics: Record<string, unknown>;
    createdAt: string;
  }>;
  nutritionPlans?: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
};

export type StaffAppointment = {
  id: string;
  status: string;
  startsAt: string;
  endsAt: string;
  client: { id: string; firstName: string; lastName: string; email: string };
  trainingProgress: Array<{ id: string; notes: string; metrics: unknown; createdAt: string }>;
  nutritionPlans: Array<{ id: string; title: string; description: string; createdAt: string }>;
  createdAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export async function listTrainers() {
  const response = await apiClient.get<ApiSuccess<Professional[]>>("/trainers");
  return response.data.data;
}

export async function listNutritionists() {
  const response = await apiClient.get<ApiSuccess<Professional[]>>("/nutritionists");
  return response.data.data;
}

export async function bookAppointment(input: {
  accessToken: string;
  professionalType: "trainer" | "nutritionist";
  professionalId: string;
  startsAt: string;
  endsAt: string;
}) {
  const path =
    input.professionalType === "trainer"
      ? `/trainers/${input.professionalId}/appointments`
      : `/nutritionists/${input.professionalId}/appointments`;

  const response = await apiClient.post<ApiSuccess<Appointment>>(
    path,
    { startsAt: input.startsAt, endsAt: input.endsAt },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function listMyAppointments(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<Appointment[]>>("/appointments/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}

export async function cancelAppointment(input: {
  accessToken: string;
  appointmentId: string;
}) {
  const response = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(
    `/appointments/${input.appointmentId}/cancel`,
    null,
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function listStaffAppointments(accessToken: string) {
  const response = await apiClient.get<ApiSuccess<StaffAppointment[]>>("/staff/appointments", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return response.data.data;
}

export async function addTrainingProgress(input: {
  accessToken: string;
  appointmentId: string;
  notes: string;
  metrics?: Record<string, unknown>;
}) {
  const response = await apiClient.post<ApiSuccess<{ id: string; notes: string; createdAt: string }>>(
    `/appointments/${input.appointmentId}/progress`,
    { notes: input.notes, metrics: input.metrics ?? {} },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}

export async function addNutritionPlan(input: {
  accessToken: string;
  appointmentId: string;
  title: string;
  description: string;
}) {
  const response = await apiClient.post<ApiSuccess<{ id: string; title: string; createdAt: string }>>(
    `/appointments/${input.appointmentId}/nutrition-plan`,
    { title: input.title, description: input.description },
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  return response.data.data;
}
