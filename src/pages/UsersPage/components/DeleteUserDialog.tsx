import * as React from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DeleteUserDialogProps {
  open: boolean;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, userEmail, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
      <DialogContent className="w-full max-w-sm bg-muted p-0 pb-5">
        {/* Header */}
        <div className="flex flex-col gap-1.5 text-center sm:text-left py-4 px-4 md:px-5">
          <h2 className="text-base leading-none font-normal">Confirmar eliminación de usuario</h2>
        </div>
        {/* Alert */}
        <div role="alert" className="relative w-full text-sm p-4 pl-12 border-t border-b border-border rounded-none -mt-px mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20" className="absolute left-4 top-4 w-6 h-6 p-1 flex rounded text-destructive-200 bg-destructive-600" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M8.15137 1.95117C9.30615 -0.0488281 12.1943 -0.0488281 13.3481 1.95117L20.7031 14.6992C21.8574 16.6992 20.4131 19.1992 18.104 19.1992H3.39502C1.08594 19.1992 -0.356933 16.6992 0.797364 14.6992L8.15137 1.95117ZM11.7666 16.0083C11.4971 16.2778 11.1313 16.4292 10.75 16.4292C10.3687 16.4292 10.0029 16.2778 9.7334 16.0083C9.46387 15.7388 9.3125 15.373 9.3125 14.9917C9.3125 14.9307 9.31641 14.8706 9.32373 14.811C9.33545 14.7197 9.35547 14.6304 9.38379 14.5439L9.41406 14.4609C9.48584 14.2803 9.59375 14.1147 9.7334 13.9751C10.0029 13.7056 10.3687 13.5542 10.75 13.5542C11.1313 13.5542 11.4971 13.7056 11.7666 13.9751C12.0361 14.2446 12.1875 14.6104 12.1875 14.9917C12.1875 15.373 12.0361 15.7388 11.7666 16.0083ZM10.75 4.69971C11.0317 4.69971 11.3022 4.81152 11.5015 5.01074C11.7007 5.20996 11.8125 5.48047 11.8125 5.76221V11.0747C11.8125 11.3564 11.7007 11.627 11.5015 11.8262C11.3022 12.0254 11.0317 12.1372 10.75 12.1372C10.4683 12.1372 10.1978 12.0254 9.99854 11.8262C9.79932 11.627 9.6875 11.3564 9.6875 11.0747V5.76221C9.6875 5.48047 9.79932 5.20996 9.99854 5.01074C10.1978 4.81152 10.4683 4.69971 10.75 4.69971Z"></path></svg>
          <h5 className="mb-1 mt-0.5 flex gap-3 text-sm font-semibold">Eliminar un usuario es irreversible</h5>
          <div className="text-sm leading-relaxed text-foreground-light font-normal">Esto eliminará al usuario seleccionado del proyecto y todos sus datos asociados.</div>
        </div>
        {/* Confirm message */}
        <div className="py-4 px-4 md:px-5 overflow-hidden">
          <p className="text-sm text-foreground-light">¡Esto es permanente! ¿Estás seguro de que deseas eliminar al usuario {userEmail}</p>
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-border" />
        {/* Footer */}
        <div className="flex gap-2 px-5 pt-5">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1" onClick={onCancel} type="button">
              <span className="truncate">Cancelar</span>
            </Button>
          </DialogClose>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} type="button">
            <span className="truncate">Eliminar</span>
          </Button>
        </div>
        {/* Floating Close Button */}
        <DialogClose asChild>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-20 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="lucide lucide-x h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
