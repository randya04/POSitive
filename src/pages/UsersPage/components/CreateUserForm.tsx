import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { ChevronsUpDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Restaurant { id: string; name: string }
interface Branch { id: string; name: string }

interface CreateUserFormProps {
  open: boolean
  onClose: () => void
  fetchUsers: () => void
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ open, onClose, fetchUsers }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'Admin'|'Host'|'Super Admin'>('Host')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Restaurante/branch
  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [restaurantPopoverOpen, setRestaurantPopoverOpen] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([])
  const [branchOptions, setBranchOptions] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isBranchLoading, setIsBranchLoading] = useState(false)
  const [branchError, setBranchError] = useState<any>(null)

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants`)
        if (!res.ok) throw new Error('Error al obtener restaurantes')
        const data = await res.json()
        setRestaurantOptions(data)
      } catch (err) {
        setRestaurantOptions([])
        // Opcional: muestra un toast o mensaje de error
      }
    }
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (selectedRestaurantId) {
      setIsBranchLoading(true)
      setBranchError(null)
      async function fetchBranches() {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/branches?restaurant_id=${selectedRestaurantId}`)
          if (!res.ok) throw new Error('Error al obtener sucursales')
          const data = await res.json()
          setBranchOptions(data)
        } catch (err) {
          setBranchOptions([])
          setBranchError('No se pudieron obtener las sucursales')
        } finally {
          setIsBranchLoading(false)
        }
      }
      fetchBranches()
    } else {
      setBranchOptions([])
      setSelectedBranchId(null)
    }
  }, [selectedRestaurantId])

  const filteredRestaurants = restaurantOptions.filter(r =>
    restaurantQuery.trim() === '' ? true : r.name.toLowerCase().includes(restaurantQuery.toLowerCase())
  )

  async function handleSave() {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Nombre es requerido'
    if (!email.trim()) newErrors.email = 'Email es requerido'
    if (!phone.trim()) newErrors.phone = 'Teléfono es requerido'
    if (!role) newErrors.role = 'Rol es requerido'
    if (role !== 'Super Admin') {
      if (!selectedRestaurantId) newErrors.restaurant = 'Restaurante es requerido'
      if (!selectedBranchId) newErrors.branch = 'Sucursal es requerida'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return
    setIsSaving(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const roleMap = {
        'Super Admin': 'super_admin',
        'Admin': 'restaurant_admin',
        'Host': 'host',
      };
      // Construir payload solo con valores definidos
      const payload: Record<string, any> = {};
      if (name) payload.full_name = name;
      if (email) payload.email = email;
      if (role) payload.role = roleMap[role] || role;
      if (phone) payload.phone = phone;
      payload.is_active = isActive;
      if (selectedRestaurantId) payload.restaurant_id = selectedRestaurantId;
      if (selectedBranchId) payload.branch_id = selectedBranchId;

      const response = await fetch(`${API_URL}/api/inviteUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseJson = await response.json();
      if (!response.ok) throw new Error(responseJson.error || 'Error creando usuario');
      toast.success('Usuario creado exitosamente');
      fetchUsers();
      onClose();
      setName('');
      setEmail('');
      setPhone('');
      setRole('Host');
      setIsActive(true);
      setSelectedRestaurantId(null);
      setSelectedBranchId(null);
      setRestaurantQuery('');
      setErrors({});
    } catch (error: any) {
      let msg = '';
      // Manejo especial para rate limit
      const { getErrorMessage } = await import('@/lib/errorMessages');
      if (error?.message?.includes('rate limit') || error?.code === 429 || error?.status === 429) {
        msg = getErrorMessage('auth/over_email_send_rate_limit');
      } else if (error?.code) {
        msg = getErrorMessage(error.code);
      } else {
        msg = error.message || 'Error creando usuario';
      }
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={val => !val && onClose()}>
      <SheetContent side="right" className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Crear usuario</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={value => setRole(value as 'Admin'|'Host'|'Super Admin')}>
              <SelectTrigger id="role" className="w-full">
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
                <Label htmlFor="restaurant">Restaurante</Label>
                <Popover open={restaurantPopoverOpen} onOpenChange={setRestaurantPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={restaurantPopoverOpen}
                      className="w-full justify-between"
                    >
                      {selectedRestaurantId
                        ? restaurantOptions.find(r => r.id === selectedRestaurantId)?.name
                        : 'Seleccionar restaurante...'}
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
                        <CommandEmpty>No hay restaurantes.</CommandEmpty>
                        <CommandGroup>
                          {filteredRestaurants.slice(0, 5).map(r => (
                            <CommandItem
                              key={r.id}
                              value={r.name}
                              onSelect={(currentValue: string) => {
                                const sel = restaurantOptions.find(x => x.name === currentValue)
                                const newId = sel?.id ?? null
                                setSelectedRestaurantId(newId === selectedRestaurantId ? null : newId)
                                setRestaurantQuery(sel?.name ?? '')
                                setRestaurantPopoverOpen(false)
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
                <Label htmlFor="branch">Sucursal</Label>
                <Select value={selectedBranchId ?? ''} onValueChange={value => setSelectedBranchId(value)} disabled={isBranchLoading || !selectedRestaurantId}>
                  <SelectTrigger id="branch" className="w-full"><SelectValue placeholder={isBranchLoading ? 'Cargando...' : 'Selecciona sucursal'} /></SelectTrigger>
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
            <Label htmlFor="isActive">Estado</Label>
            <Switch
              id="isActive"
              checked={role === 'Super Admin' ? true : isActive}
              disabled={role === 'Super Admin'}
              onCheckedChange={value => {
                if (role !== 'Super Admin') setIsActive(value)
              }}
            />
          </div>
        </div>
        <SheetFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear usuario'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
