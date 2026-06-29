export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
};

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export type UserRole =
  | "Administrador"
  | "Recepcionista"
  | "Cliente"
  | "Entrenador"
  | "Nutricionista";
