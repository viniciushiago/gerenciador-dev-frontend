"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Estado } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Paginacao from "@/components/shared/Paginacao";

export default function PaginaEstados() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [estadoEditando, setEstadoEditando] = useState<Estado | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [formulario, setFormulario] = useState({ nome: "", uf: "" });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const buscarEstados = async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroNome) parametros.append("nome", filtroNome);
      const resposta = await api.get(`/estados?${parametros}`);
      setEstados(resposta.data);
      setPaginaAtual(1);
    } catch {
      toast.error("Erro ao buscar estados.");
    }
  };

  useEffect(() => { buscarEstados(); }, []);

  const aoAbrirCriacao = () => {
    setEstadoEditando(null);
    setFormulario({ nome: "", uf: "" });
    setDialogoAberto(true);
  };

  const aoAbrirEdicao = (estado: Estado) => {
    setEstadoEditando(estado);
    setFormulario({ nome: estado.nome, uf: estado.uf });
    setDialogoAberto(true);
  };

  const aoEnviarFormulario = async () => {
    try {
      setCarregando(true);
      if (estadoEditando) {
        await api.put(`/estados/${estadoEditando.id}`, {
          id: estadoEditando.id,
          ...formulario,
        });
        toast.success("Estado atualizado com sucesso!");
      } else {
        await api.post("/estados", formulario);
        toast.success("Estado criado com sucesso!");
      }
      setDialogoAberto(false);
      buscarEstados();
    } catch (erro: any) {
      toast.error(erro.response?.data || "Erro ao salvar estado.");
    } finally {
      setCarregando(false);
    }
  };

  const aoDeletar = async (id: number) => {
    if (!confirm("Deseja deletar este estado?")) return;
    try {
      await api.delete(`/estados/${id}`);
      toast.success("Estado deletado com sucesso!");
      buscarEstados();
    } catch {
      toast.error("Erro ao deletar estado.");
    }
  };

  const totalPaginas = Math.ceil(estados.length / itensPorPagina);
  const estadosPaginados = estados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estados</h1>
        <Button onClick={aoAbrirCriacao}>Novo Estado</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Nome</Label>
              <Input
                placeholder="Filtrar por nome..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={buscarEstados}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">UF</th>
                <th className="text-left py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estadosPaginados.map((estado) => (
                <tr key={estado.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{estado.nome}</td>
                  <td className="py-2 px-4">{estado.uf}</td>
                  <td className="py-2 px-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => aoAbrirEdicao(estado)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => aoDeletar(estado.id)}>
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacao
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            aoMudarPagina={setPaginaAtual}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>
              {estadoEditando ? "Editar Estado" : "Novo Estado"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>UF</Label>
              <Input
                maxLength={2}
                value={formulario.uf}
                onChange={(e) => setFormulario({ ...formulario, uf: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogoAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={aoEnviarFormulario} disabled={carregando}>
                {carregando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}