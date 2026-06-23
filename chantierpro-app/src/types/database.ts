export type UserRole = "admin" | "chef_chantier" | "conducteur_travaux" | "ouvrier" | "client";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Chantier {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  status: "planifie" | "en_cours" | "suspendu" | "termine" | "annule";
  budget: number;
  start_date: string;
  end_date: string | null;
  owner_id: string;
  created_at: string;
}

export interface DailyReport {
  id: string;
  chantier_id: string;
  author_id: string;
  report_date: string;
  weather: "soleil" | "nuageux" | "pluie" | "orage";
  temperature: number | null;
  summary: string;
  workers_present: number;
  tasks_completed: string;
  issues: string | null;
  photos: string[];
  signature_url: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  chantier_id: string;
  author_id: string;
  category: "materiaux" | "main_oeuvre" | "transport" | "location_engin" | "autre";
  description: string;
  amount: number;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
}
