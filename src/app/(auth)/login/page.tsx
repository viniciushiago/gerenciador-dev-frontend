"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const esquemaLogin = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

type FormularioLogin = z.infer<typeof esquemaLogin>;

export default function PaginaLogin() {
  const roteador = useRouter();
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    mode: "onSubmit",
  });

  const aoEnviar = async (dados: FormularioLogin) => {
    try {
      setCarregando(true);
      const resposta = await api.post("/auth/login", dados);
      localStorage.setItem("token", resposta.data.token);
      toast.success("Login realizado com sucesso!");
      roteador.push("/desenvolvedores");
    } catch (erro: unknown) {
  if (axios.isAxiosError(erro)) {
    toast.error(erro.response?.data || "Erro ao fazer login.");
  } else {
      toast.error("Erro inesperado.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Gerenciador de Devs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                {...register("senha")}
              />
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-sm text-gray-500">
                Não tem uma conta?{" "}
            <a href="/cadastro" className="text-gray-900 font-medium hover:underline">
                Cadastre-se
            </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}