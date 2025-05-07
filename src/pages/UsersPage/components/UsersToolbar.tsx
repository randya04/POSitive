import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { ChevronsUpDown, Funnel } from 'lucide-react'
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
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  roleComboboxValue: string;
  setRoleComboboxValue: (value: string) => void;
  roleComboboxOpen: boolean;
  setRoleComboboxOpen: (open: boolean) => void;
  roleComboboxQuery: string;
  setRoleComboboxQuery: (q: string) => void;
  roleOptions: { value: string; label: string }[];
  statusComboboxValue: string;
  setStatusComboboxValue: (value: string) => void;
  statusComboboxOpen: boolean;
  setStatusComboboxOpen: (open: boolean) => void;
  statusComboboxQuery: string;
  setStatusComboboxQuery: (q: string) => void;
  statusOptions: { value: string; label: string }[];
  restaurantComboboxValue: string;
  setRestaurantComboboxValue: (value: string) => void;
  restaurantComboboxOpen: boolean;
  setRestaurantComboboxOpen: (open: boolean) => void;
  restaurantComboboxQuery: string;
  setRestaurantComboboxQuery: (q: string) => void;
  restaurantOptions: { id: string; name: string }[];
  clearAllFilters: () => void;
}

export const UsersToolbar: React.FC<UsersToolbarProps> = ({
  globalFilter,
  setGlobalFilter,
  roleComboboxValue,
  setRoleComboboxValue,
  roleComboboxOpen,
  setRoleComboboxOpen,
  roleComboboxQuery,
  setRoleComboboxQuery,
  roleOptions,
  statusComboboxValue,
  setStatusComboboxValue,
  statusComboboxOpen,
  setStatusComboboxOpen,
  statusComboboxQuery,
  setStatusComboboxQuery,
  statusOptions,
  restaurantComboboxValue,
  setRestaurantComboboxValue,
  restaurantComboboxOpen,
  setRestaurantComboboxOpen,
  restaurantComboboxQuery,
  setRestaurantComboboxQuery,
  restaurantOptions,
  clearAllFilters,
}) => (
  <div className="flex flex-row items-center w-full justify-between gap-4 overflow-x-auto">
    <div className="flex flex-row flex-wrap items-center gap-2 flex-1 min-w-0">
      <Input
        placeholder="Buscar usuario, email, rol, restaurante o teléfono..."
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
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
            <Popover open={roleComboboxOpen} onOpenChange={setRoleComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setRoleComboboxOpen(true)}
                >
                  {roleComboboxValue
                    ? roleOptions.find((r) => r.value === roleComboboxValue)?.label
                    : 'Seleccionar rol...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full p-0 mt-1">
                <Command className="w-full">
                  <CommandInput
                    value={roleComboboxQuery}
                    onValueChange={setRoleComboboxQuery}
                    placeholder="Buscar rol..."
                  />
                  <CommandList className="text-left">
                    <CommandEmpty>No hay roles.</CommandEmpty>
                    <CommandGroup heading="Roles">
                      {roleOptions
                        .filter((r) => r.label.toLowerCase().includes(roleComboboxQuery.toLowerCase()))
                        .map((r) => (
                          <CommandItem
                            key={r.value}
                            value={r.label}
                            onSelect={() => {
                              setRoleComboboxValue(r.value)
                              setRoleComboboxOpen(false)
                            }}
                          >
                            {r.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Label>Estado</Label>
            <Popover open={statusComboboxOpen} onOpenChange={setStatusComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setStatusComboboxOpen(true)}
                >
                  {statusComboboxValue
                    ? statusOptions.find((s) => s.value === statusComboboxValue)?.label
                    : 'Seleccionar estado...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full p-0 mt-1">
                <Command className="w-full">
                  <CommandInput
                    value={statusComboboxQuery}
                    onValueChange={setStatusComboboxQuery}
                    placeholder="Buscar estado..."
                  />
                  <CommandList className="text-left">
                    <CommandEmpty>No hay estados.</CommandEmpty>
                    <CommandGroup heading="Estados">
                      {statusOptions
                        .filter((s) => s.label.toLowerCase().includes(statusComboboxQuery.toLowerCase()))
                        .map((s) => (
                          <CommandItem
                            key={s.value}
                            value={s.label}
                            onSelect={() => {
                              setStatusComboboxValue(s.value)
                              setStatusComboboxOpen(false)
                            }}
                          >
                            {s.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Label>Restaurante</Label>
            <Popover open={restaurantComboboxOpen} onOpenChange={setRestaurantComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setRestaurantComboboxOpen(true)}
                >
                  {restaurantComboboxValue
                    ? restaurantOptions.find((r) => r.id === restaurantComboboxValue)?.name
                    : 'Seleccionar restaurante...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full p-0 mt-1">
                <Command className="w-full">
                  <CommandInput
                    value={restaurantComboboxQuery}
                    onValueChange={setRestaurantComboboxQuery}
                    placeholder="Buscar restaurante..."
                  />
                  <CommandList className="text-left">
                    <CommandEmpty>No hay restaurantes.</CommandEmpty>
                    <CommandGroup heading="Restaurantes">
                      {restaurantOptions
                        .filter((r) => r.name.toLowerCase().includes(restaurantComboboxQuery.toLowerCase()))
                        .map((r) => (
                          <CommandItem
                            key={r.id}
                            value={r.name}
                            onSelect={() => {
                              setRestaurantComboboxValue(r.id)
                              setRestaurantComboboxOpen(false)
                            }}
                          >
                            {r.name}
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
  </div>
);
