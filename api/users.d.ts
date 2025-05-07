// TypeScript declaration file for users.js
import type { User, Restaurant, Branch } from '../src/types/user'

export function getUsers(): Promise<User[]>;
export function toggleUserActive(id: string, value: boolean): Promise<void>;
export function createUser(data: any): Promise<void>;
export function updateUser(id: string, data: any): Promise<void>;
export function deleteUser(id: string): Promise<void>;
export function getRestaurants(): Promise<Restaurant[]>;
export function getBranches(restaurantId: string): Promise<Branch[]>;
