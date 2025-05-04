import * as Dialog from "@radix-ui/react-dialog";
import { Menu } from "lucide-react";
import { NavMain } from "../nav-main";
import { NavProjects } from "../nav-projects";
import { NavSecondary } from "../nav-secondary";
import { navData } from "../app-sidebar";

/**
 * Componente de menú móvil con hamburguesa
 */
export function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button aria-label="Abrir menú" className="p-2">
          <Menu className="h-6 w-6 text-foreground dark:text-foreground" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-y-0 left-0 w-64 bg-card text-card-foreground p-6 overflow-y-auto shadow-lg">
          <NavMain />
          <NavProjects projects={navData.projects} />
          <NavSecondary items={navData.navSecondary} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}