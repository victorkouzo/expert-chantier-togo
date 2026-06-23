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

export type Specialty = "general" | "maconnerie" | "electricite" | "plomberie" | "peinture" | "charpente" | "ferraillage" | "coffrage" | "finition" | "autre";

export interface Team {
  id: string;
  chantier_id: string;
  name: string;
  specialty: Specialty;
  created_at: string;
}

export type MemberRole = "chef_equipe" | "ouvrier" | "apprenti" | "manoeuvre";

export interface TeamMember {
  id: string;
  team_id: string;
  full_name: string;
  role: MemberRole;
  phone: string | null;
  daily_rate: number;
  is_active: boolean;
  created_at: string;
}

export type TaskStatus = "a_faire" | "en_cours" | "termine" | "bloque";
export type TaskPriority = "basse" | "normale" | "haute" | "urgente";

export interface Task {
  id: string;
  chantier_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_team_id: string | null;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  created_at: string;
}

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export type DocumentCategory = "contrat" | "plan" | "permis" | "facture" | "pv_reception" | "rapport_inspection" | "photo" | "autre";

export interface Document {
  id: string;
  chantier_id: string;
  uploaded_by: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  file_url: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
}
