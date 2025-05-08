import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type RoleOption = { label: string; value: string }

interface FilterControlsProps {
  nameQuery: string;
  onNameChange: (val: string) => void;
  roleFilter: RoleOption | null;
  onRoleChange: (val: RoleOption | null) => void;
  statusFilter: { label: string; value: string } | null;
  onStatusChange: (val: string | null) => void;
  restaurantFilter: { id: string; name: string } | null;
  onRestaurantChange: (val: { id: string; name: string } | null) => void;
  clearFilters: () => void;
  onCreateUser: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  nameQuery,
  onNameChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  restaurantFilter,
  onRestaurantChange,
  clearFilters,
  onCreateUser,
}) => {
  const [restaurantQuery] = useState('');

  const supabase = useSupabaseClient()
  const { data: searchResults } = useRestaurantSearch(supabase, restaurantQuery)

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Input
        placeholder="Buscar por nombre"
        value={nameQuery}
        onChange={e => onNameChange(e.target.value)}
        className="flex-1 min-w-[200px]"
      />
      {/* Role Filter */}
      <Select
        value={roleFilter?.value || ''}
        onValueChange={(val: string) => onRoleChange(val ? { label: val, value: val } : null)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          {[{label:'Super Admin',value:'Super Admin'},{label:'Admin',value:'Admin'},{label:'Host',value:'Host'}].map(r => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Status Filter */}
      <Select
        value={statusFilter?.value || ''}
        onValueChange={val => onStatusChange(val || null)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
        </SelectContent>
      </Select>
      {/* Restaurant Filter */}
      <Select
        value={restaurantFilter?.id || ''}
        onValueChange={val => {
          const found = searchResults?.find((r: { id: string; name: string }) => r.id === val)
          onRestaurantChange(found ? found : null)
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Restaurante" />
        </SelectTrigger>
        <SelectContent>
          {searchResults?.map((r: { id: string; name: string }) => (
            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={clearFilters}>Limpiar</Button>
      <Button variant="default" onClick={onCreateUser}>Nuevo usuario</Button>
    </div>
  )
}