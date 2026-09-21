export type UserPlan = "STANDARD" | "PREMIUM";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  token: string;
  plan: UserPlan;
  admin: boolean;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  token: string;
  plan?: UserPlan;
  admin?: boolean;
}
