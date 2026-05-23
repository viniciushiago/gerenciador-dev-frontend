"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const esquemaCadastro = z.object({
  nome:  z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type FormularioCadastro = z.infer<typeof esquemaCadastro>;

export default function PaginaCadastro() {
  const roteador = useRouter();
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioCadastro>({
    resolver: zodResolver(esquemaCadastro),
    mode: "onSubmit",
  });

  const aoEnviar = async (dados: FormularioCadastro) => {
    try {
      setCarregando(true);
      await api.post("/usuarios", dados);
      toast.success("Cadastro realizado com sucesso!");
      roteador.push("/login");
    } catch (erro: any) {
      toast.error(erro.response?.data || "Erro ao realizar cadastro.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Seu nome"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>

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
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Já tem uma conta?{" "}
              <a href="/login" className="text-gray-900 font-medium hover:underline">
                Entrar
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}