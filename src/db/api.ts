import { supabase } from './supabase';
import type { Product, WasteClassification, Feedback, Profile } from '@/types';

// Products API
export const productsApi = {
  async getAll(filters?: { material?: string; minPrice?: number; maxPrice?: number; search?: string }) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters?.material && filters.material !== 'all') {
      query = query.eq('material_type', filters.material);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Product[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Product | null;
  },

  async getByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Product[];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Product;
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Product;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Waste Classifications API
export const wasteClassificationsApi = {
  async getByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('waste_classifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as WasteClassification[];
  },

  async create(classification: Omit<WasteClassification, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('waste_classifications')
      .insert([classification])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as WasteClassification;
  }
};

// Feedback API
export const feedbackApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Feedback[];
  },

  async create(feedback: Omit<Feedback, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Feedback;
  }
};

// Profiles API
export const profilesApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Profile[];
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Profile;
  }
};

// Storage API
export const storageApi = {
  async uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('app-7tqb6jyvh98h_agricraft_images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('app-7tqb6jyvh98h_agricraft_images')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteImage(path: string) {
    const { error } = await supabase.storage
      .from('app-7tqb6jyvh98h_agricraft_images')
      .remove([path]);

    if (error) throw error;
  }
};
