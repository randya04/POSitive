import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { ChevronsUpDown, Funnel, Check } from 'lucide-react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import React from 'react'

interface UsersToolbarProps {
  /**
   * Callback único que se llama cuando cambia cualquier filtro. El padre debe usarlo para filtrar la tabla.
   */
  onFilterChange: (filters: {
    search?: string;
    role?: string;
    status?: string;
    restaurant?: string;
  }) => void;
}

interface UsersToolbarProps {
  onFilterChange: (filters: {
    search?: string;
    role?: string;
    status?: string;
    restaurant?: string;
  }) => void;
  onCreateUser: () => void;
}

export const UsersToolbar: React.FC<UsersToolbarProps> = ({ onFilterChange, onCreateUser }) => {
  // Opciones locales (puedes ajustar según tu modelo de datos)
  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'host', label: 'Host' },
    { value: 'restaurant_admin', label: 'Admin' },
  ];
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
  ];
  // Opcional: puedes poblar restaurantOptions por props o fetch
  const restaurantOptions = [
    { id: '', name: 'Todos los restaurantes' },
    // ...
  ];

  // Estados internos para los filtros
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [restaurant, setRestaurant] = React.useState('');
  // Estado de apertura para cada popover de filtro
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [restaurantOpen, setRestaurantOpen] = React.useState(false);

  // Limpiar filtros
  const clearAllFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setRestaurant('');
  };

  // Notificar cambios al padre
  React.useEffect(() => {
    onFilterChange({ search, role, status, restaurant });
  }, [search, role, status, restaurant, onFilterChange]);

  return (
    <div className="flex flex-row items-center w-full gap-2">
      <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
        <Input
          placeholder="Buscar usuario, email, rol, restaurante o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              Filtrar
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="min-w-[220px] w-64 p-4">
            <div className="grid gap-2">
              <Label>Rol</Label>
              <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {role ? roleOptions.find((r) => r.value === role)?.label : 'Seleccionar rol...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-full p-0 mt-1">
                  <Command className="w-full">
                    <CommandInput
                      placeholder="Buscar rol..."
                      onValueChange={() => {}}
                    />
                    <CommandList className="text-left">
                      <CommandEmpty>No hay roles.</CommandEmpty>
                      <CommandGroup heading="Roles">
                        {roleOptions.map((r) => (
                          <CommandItem
                            key={r.value}
                            value={r.label}
                            onSelect={() => {
                              setRole(r.value);
                              setRoleOpen(false);
                            }}
                            className="relative"
                          >
                            {r.label}
                            {role === r.value && (
                              <span className="absolute right-2 flex items-center">
                                <Check className="w-4 h-4 text-primary" />
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label>Estado</Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {status ? statusOptions.find((s) => s.value === status)?.label : 'Seleccionar estado...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-full p-0 mt-1">
                  <Command className="w-full">
                    <CommandInput
                      placeholder="Buscar estado..."
                      onValueChange={() => {}}
                    />
                    <CommandList className="text-left">
                      <CommandEmpty>No hay estados.</CommandEmpty>
                      <CommandGroup heading="Estados">
                        {statusOptions.map((s) => (
                          <CommandItem
                            key={s.value}
                            value={s.label}
                            onSelect={() => {
                              setStatus(s.value);
                              setStatusOpen(false);
                            }}
                            className="relative"
                          >
                            {s.label}
                            {status === s.value && (
                              <span className="absolute right-2 flex items-center">
                                <Check className="w-4 h-4 text-primary" />
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Label>Restaurante</Label>
              <Popover open={restaurantOpen} onOpenChange={setRestaurantOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {restaurant ? restaurantOptions.find((r) => r.id === restaurant)?.name : 'Seleccionar restaurante...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-full p-0 mt-1">
                  <Command className="w-full">
                    <CommandInput
                      placeholder="Buscar restaurante..."
                      onValueChange={() => {}}
                    />
                    <CommandList className="text-left">
                      <CommandEmpty>No hay restaurantes.</CommandEmpty>
                      <CommandGroup heading="Restaurantes">
                        {restaurantOptions.map((r) => (
                          <CommandItem
                            key={r.id}
                            value={r.name}
                            onSelect={() => {
                              setRestaurant(r.id);
                              setRestaurantOpen(false);
                            }}
                            className="relative"
                          >
                            {r.name}
                            {restaurant === r.id && (
                              <span className="absolute right-2 flex items-center">
                                <Check className="w-4 h-4 text-primary" />
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" className="w-full mt-2" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="ml-auto">
        <Button variant="default" onClick={onCreateUser}>Crear usuario</Button>
      </div>
    </div>
  );
};
