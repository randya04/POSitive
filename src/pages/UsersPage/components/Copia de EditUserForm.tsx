import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { ChevronsUpDown, Trash2, Check } from 'lucide-react';
import { updateUser } from '@/api/users';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import DeleteUserDialog from './DeleteUserDialog';

import { User } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Branch {
  id: string;
  name: string;
}

interface EditUserFormProps {
  user: User;
  onClose: () => void;
  fetchUsers: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, fetchUsers }) => {
  // ...otros estados
  // ...
  // handleUpdate migrado de UsersReference
  async function handleUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nombre es requerido';
    if (!email.trim()) newErrors.email = 'Email es requerido';
    if (!phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!role) newErrors.role = 'Rol es requerido';
    if (role !== 'Super Admin') {
      if (!selectedRestaurantId) newErrors.restaurant = 'Restaurante es requerido';
      if (!selectedBranchId) newErrors.branch = 'Sucursal es requerida';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    setLoading(true);
    try {
      await updateUser(user.id, {
        full_name: name,
        email,
        phone,
        role: role === 'Super Admin' ? 'super_admin' : role === 'Admin' ? 'restaurant_admin' : 'host',
        is_active: isActive,
        restaurant_id: role !== 'Super Admin' ? selectedRestaurantId : null,
        branch_id: role !== 'Super Admin' ? selectedBranchId : null,
      });
      toast.success('Usuario actualizado');
      fetchUsers();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error actualizando usuario');
    } finally {
      setLoading(false);
    }
  }
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState(user.role === 'super_admin' ? 'Super Admin' : user.role === 'restaurant_admin' ? 'Admin' : 'Host');
  const [isActive, setIsActive] = useState(user.is_active);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [restaurantQuery, setRestaurantQuery] = useState('');
  const [restaurantPopoverOpen, setRestaurantPopoverOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(user.restaurant ?? null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(user.branch_id ?? null);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [restaurantOptions, setRestaurantOptions] = useState<{ id: string, name: string }[]>([]);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState<any>(null);

  // Carga la lista de restaurantes desde el backend propio (no Supabase directo)
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch(`${API_URL}/api/restaurants`);
        const text = await res.text();
        let data = [];
        try {
          data = JSON.parse(text);
        } catch (err) {
          setRestaurantOptions([]);
          setBranchOptions([]);
          setBranchError({ message: 'Error: respuesta inválida de la API de restaurantes.' });
          return;
        }
        setRestaurantOptions(data || []);
      } catch (err) {
        setRestaurantOptions([]);
        setBranchOptions([]);
        setBranchError({ message: 'Error de red al cargar restaurantes.' });
      }
    }
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!selectedRestaurantId) { setBranchOptions([]); setSelectedBranchId(null); return; }
    setIsBranchLoading(true);
    fetch(`${API_URL}/api/branches?restaurant_id=${selectedRestaurantId}`)
      .then(async res => {
        const text = await res.text();
        let data = [];
        try {
          data = JSON.parse(text);
        } catch (err) {
          setBranchOptions([]);
          setIsBranchLoading(false);
          setBranchError({ message: 'Error: respuesta inválida de la API de sucursales.' });
          return;
        }
        setBranchOptions(data || []);
        setIsBranchLoading(false);
        setBranchError(null);
      })
      .catch(error => {
        setIsBranchLoading(false);
        setBranchOptions([]);
        setBranchError({ message: 'Error de red al cargar sucursales.' });
      });
  }, [selectedRestaurantId]);

  // Inicialización controlada para evitar doble seteo y efectos dobles
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    if (!user.restaurant || restaurantOptions.length === 0) return;
    let newRestaurantId: string | null = null;
    // ¿user.restaurant es un ID válido?
    const byId = restaurantOptions.find(r => r.id === user.restaurant);
    if (byId) newRestaurantId = byId.id;
    // ¿user.restaurant es un nombre válido?
    if (!newRestaurantId) {
      const byName = restaurantOptions.find(r => r.name === user.restaurant);
      if (byName) newRestaurantId = byName.id;
    }
    setSelectedRestaurantId(newRestaurantId);
    setSelectedBranchId(user.branch_id ?? null);
    setInitialized(true);
  }, [user.restaurant, user.branch_id, restaurantOptions, initialized]);

  // Solo hace fetch de sucursales si el restaurante está correctamente seteado y ya fue inicializado
  // Carga la lista de sucursales para el restaurante seleccionado usando el endpoint backend
  useEffect(() => {
    if (!initialized || !selectedRestaurantId) { setBranchOptions([]); setSelectedBranchId(null); return; }
    setIsBranchLoading(true);
    fetch(`${API_URL}/api/branches?restaurant_id=${selectedRestaurantId}`)
      .then(async res => {
        const text = await res.text();
        let data = [];
        try {
          data = JSON.parse(text);
        } catch (err) {
          setBranchOptions([]);
          setIsBranchLoading(false);
          setBranchError({ message: 'Error: respuesta inválida de la API de sucursales.' });
          return;
        }
        setBranchOptions(data || []);
        setIsBranchLoading(false);
        setBranchError(null);
      })
      .catch(error => {
        setIsBranchLoading(false);
        setBranchOptions([]);
        setBranchError({ message: 'Error de red al cargar sucursales.' });
      });
  }, [selectedRestaurantId, initialized]);



  async function handleDeleteUser() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error eliminando usuario');
      toast.success('Usuario eliminado');
      fetchUsers();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error eliminando usuario');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <form className="grid gap-4 p-4" onSubmit={handleUpdate}>
      <div className="mb-2">
        <h2 className="text-xl font-semibold leading-tight">Editar usuario</h2>
        <p className="text-muted-foreground text-sm mt-1">Modifica los datos del usuario seleccionado. Recuerda guardar los cambios.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-name">Nombre completo</Label>
        <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-phone">Teléfono</Label>
        <Input id="edit-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-role">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="edit-role" className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Host">Host</SelectItem>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-600 text-sm">{errors.role}</p>}
      </div>
      {(role === 'Admin' || role === 'Host') && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="edit-restaurant">Restaurante</Label>
            <Popover open={restaurantPopoverOpen} onOpenChange={setRestaurantPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedRestaurantId
                    ? restaurantOptions.find(r => r.id === selectedRestaurantId)?.name
                    : 'Selecciona restaurante'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full sm:w-[350px] p-0 mt-1">
                <Command className="w-full min-w-0">
                  <CommandInput
                    value={restaurantQuery}
                    onValueChange={setRestaurantQuery}
                    placeholder="Buscar restaurante..."
                  />
                  <CommandList className="text-left">
                    <CommandEmpty>No se encontró restaurante.</CommandEmpty>
                    <CommandGroup>
                      {restaurantOptions.filter(r => r.name.toLowerCase().includes(restaurantQuery.toLowerCase())).slice(0, 5).map(r => (
                        <CommandItem
                          key={r.id}
                          value={r.name}
                          onSelect={currentValue => {
                            const sel = restaurantOptions.find(x => x.name === currentValue);
                            setSelectedRestaurantId(sel ? sel.id : null);
                            setRestaurantQuery(sel ? sel.name : '');
                            setRestaurantPopoverOpen(false);
                            setSelectedBranchId(null); // Limpiar sucursal al cambiar restaurante
                          }}
                        >
                          {r.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedRestaurantId === r.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.restaurant && <p className="text-red-600 text-sm">{errors.restaurant}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-branch">Sucursal</Label>
            <Select value={selectedBranchId ?? ''} onValueChange={setSelectedBranchId} disabled={isBranchLoading || !selectedRestaurantId}>
              <SelectTrigger id="edit-branch" className="w-full"><SelectValue placeholder={isBranchLoading ? 'Cargando...' : 'Selecciona sucursal'} /></SelectTrigger>
              <SelectContent>
                {branchOptions.map((br: Branch) => <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {branchError && <p className="text-red-600 text-sm">{branchError.message}</p>}
            {errors.branch && <p className="text-red-600 text-sm">{errors.branch}</p>}
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <Label htmlFor="edit-isActive">Estado</Label>
        <Switch id="edit-isActive" checked={role === 'Super Admin' ? true : isActive} disabled={role === 'Super Admin'} onCheckedChange={value => { if (role !== 'Super Admin') setIsActive(value) }} />
      </div>
      <SheetFooter>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Guardar cambios
          </Button>
        </div>
      </SheetFooter>
      <div className="my-6 border-t" />
      
      {/* Zona peligrosa */}
      <div>
        <h3 className="text-base font-semibold">Zona peligrosa</h3>
        <p className="text-sm">Ten cuidado, estas acciones no se pueden deshacer.</p>
      </div>
      <div className="mt-2 border border-destructive rounded-lg bg-destructive/5">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-sm text-destructive">Eliminar usuario</div>
            <div className="text-xs text-destructive">El usuario ya no tendrá acceso al proyecto</div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} disabled={loading}>
            <Trash2 className="mr-2 w-5 h-5 text-destructive" /> Eliminar usuario
          </Button>
        </div>
      </div>
      <DeleteUserDialog
        open={deleteDialogOpen}
        userEmail={user.email}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </form>
  );
  
};
