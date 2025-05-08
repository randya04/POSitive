export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  restaurant: string | null;
  restaurant_id: string | null;
  branch?: string | null; // opcional para compatibilidad
  branch_id?: string | null; // opcional para compatibilidad
  branch_ids: string[]; // NUEVO: sucursales asociadas
  is_active: boolean;
}
  
  export interface Restaurant {
    id: string;
    name: string;
  }
  
  export interface Branch {
    id: string;
    name: string;
  }
  
  export interface EditUserFormProps {
    user: User;
    onClose: () => void;
    fetchUsers: () => void;
  }