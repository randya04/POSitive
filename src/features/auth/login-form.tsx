import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { getErrorMessage } from "@/lib/errorMessages";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPass = localStorage.getItem("rememberPassword");
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("LoginForm.handleSubmit called", { email, password });
    try {
      await login(email, password);
      console.log("LoginForm.handleSubmit: success branch");
      toast.success("Inicio de sesión exitoso");
      console.log("LoginForm.handleSubmit: after toast.success");
      navigate("/dashboard", { replace: true });
      console.log("LoginForm.handleSubmit: after navigate");
      // Store or clear credentials per user choice
      if (remember) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("rememberPassword");
      }
    } catch (err: any) {
      console.error("LoginForm.handleSubmit ERROR", err);
      const msg = getErrorMessage(err.code);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresar correo electrónico"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(!!checked)}
                  />
                  <Label htmlFor="remember">Recordar mis datos</Label>
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
