export type Role = "admin" | "student";

export interface School {
  id: number;
  name: string;
  npsn?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  is_active?: boolean;
  students_count?: number;
  admins_count?: number;
}

export interface SchoolClass {
  id: number;
  school_id: number;
  name: string;
  grade?: string | null;
  is_active: boolean;
  students_count?: number;
}

export interface User {
  id: number;
  name: string;
  nisn?: string | null;
  email?: string | null;
  role: Role;
  class?: string | null;
  origin_school?: string | null;
  school_id?: number | null;
  school?: School | null;
  is_active: boolean;
}

export interface Progress {
  rapor_complete: boolean;
  questionnaire_complete: boolean;
  recommendation_complete: boolean;
  score_count: number;
  answer_count: number;
  subject_total: number;
  question_total: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface StudentScore {
  id: number;
  subject_id: number;
  sem1?: string | number | null;
  sem2?: string | number | null;
  sem3?: string | number | null;
  sem4?: string | number | null;
  sem5?: string | number | null;
  score: string | number;
  subject?: Subject;
}

export interface Question {
  id: number;
  category_id: number;
  question: string;
  order_num: number;
  category?: InterestCategory;
}

export interface QuestionnaireAnswer {
  id: number;
  user_id: number;
  question_id: number;
  score: number;
  question?: Question;
}

export interface InterestCategory {
  id: number;
  name: string;
  icon?: string | null;
  questions: Question[];
}

export interface ProgramCriteria {
  primary_subject_id: number;
  primary_weight: string | number;
  secondary_subject_id?: number | null;
  secondary_weight?: string | number | null;
  interest_category_id: number;
  interest_weight: string | number;
  primary_subject?: Subject;
  secondary_subject?: Subject | null;
  interest_category?: InterestCategory;
}

export interface StudyProgram {
  id: number;
  name: string;
  faculty?: string | null;
  description?: string | null;
  career_paths?: string[] | null;
  learning_path?: Record<string, string> | null;
  universities?: string[] | null;
  criteria?: ProgramCriteria | null;
}

export interface RecommendationResult {
  id: number;
  program_id: number;
  program: StudyProgram;
  primary_score: string | number | null;
  secondary_score: string | number | null;
  interest_score: string | number | null;
  normalized_primary: string | number | null;
  normalized_secondary: string | number | null;
  normalized_interest: string | number | null;
  preference_value: string | number;
  rank_position: number;
}

export interface Recommendation {
  id: number;
  calculated_at: string;
  counselor_notes?: string | null;
  counselor_id?: number | null;
  counselor_reviewed_at?: string | null;
  counselor?: User | null;
  user?: User;
  results: RecommendationResult[];
}

export interface StudentListItem {
  id: number;
  name: string;
  nisn: string;
  email?: string | null;
  class?: string | null;
  school_id?: number | null;
  school_name?: string | null;
  is_active: boolean;
  rapor_complete: boolean;
  questionnaire_complete: boolean;
  recommendation_complete: boolean;
}

export interface AdminListItem {
  id: number;
  name: string;
  email: string;
  school_id?: number | null;
  school?: School | null;
  is_active: boolean;
  created_at: string;
}

