export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface Profile {
  id: string;
  username: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  title: string;
  description: string | null;
  image_url: string;
  price: number;
  material_type: string;
  farmer_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WasteClassification {
  id: string;
  farmer_id: string;
  image_url: string;
  detected_type: string | null;
  confidence: string | null;
  ai_response: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  message: string;
  created_at: string;
}
