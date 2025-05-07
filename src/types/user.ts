export interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    restaurant: string | null;
    branch_id: string | null;
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