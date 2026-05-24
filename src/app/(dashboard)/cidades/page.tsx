"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Cidade, Estado } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Paginacao from "@/components/shared/Paginacao";
import axios from "axios";

export default function PaginaCidades() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [cidadeEditando, setCidadeEditando] = useState<Cidade | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [formulario, setFormulario] = useState({ nome: "", estadoId: 0 });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const buscarCidades = async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroNome) parametros.append("nome", filtroNome);
      const resposta = await api.get(`/cidades?${parametros}`);
      setCidades(resposta.data);
      setPaginaAtual(1);
    } catch {
      toast.error("Erro ao buscar cidades.");
    }
  };

  const buscarEstados = async () => {
    const resposta = await api.get("/estados");
    setEstados(resposta.data);
  };

  useEffect(() => {
    buscarCidades();
    buscarEstados();
  }, []);

  const aoAbrirCriacao = () => {
    setCidadeEditando(null);
    setFormulario({ nome: "", estadoId: 0 });
    setDialogoAberto(true);
  };

  const aoAbrirEdicao = (cidade: Cidade) => {
    setCidadeEditando(cidade);
    setFormulario({ nome: cidade.nome, estadoId: cidade.estadoId });
    setDialogoAberto(true);
  };

  const aoEnviarFormulario = async () => {
    try {
      setCarregando(true);
      if (cidadeEditando) {
        await api.put(`/cidades/${cidadeEditando.id}`, {
          id: cidadeEditando.id,
          nome: formulario.nome,
        });
        toast.success("Cidade atualizada com sucesso!");
      } else {
        await api.post("/cidades", formulario);
        toast.success("Cidade criada com sucesso!");
      }
      setDialogoAberto(false);
      buscarCidades();
    } catch (erro: unknown) {
    if (axios.isAxiosError(erro)) {
      toast.error(erro.response?.data || "Erro ao salvar cidade.");
    } else {
      toast.error("Erro inesperado.");
    }
    } finally {
      setCarregando(false);
    }
  };

  const aoDeletar = async (id: number) => {
    if (!confirm("Deseja deletar esta cidade?")) return;
    try {
      await api.delete(`/cidades/${id}`);
      toast.success("Cidade deletada com sucesso!");
      buscarCidades();
    } catch {
      toast.error("Erro ao deletar cidade.");
    }
  };

  const nomeEstado = (estadoId: number) =>
    estados.find((e) => e.id === estadoId)?.nome || "-";

  const totalPaginas = Math.ceil(cidades.length / itensPorPagina);
  const cidadesPaginadas = cidades.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cidades</h1>
        <Button onClick={aoAbrirCriacao}>Nova Cidade</Button>
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
              <Button onClick={buscarCidades}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cidades</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">Estado</th>
                <th className="text-left py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cidadesPaginadas.map((cidade) => (
                <tr key={cidade.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{cidade.nome}</td>
                  <td className="py-2 px-4">{nomeEstado(cidade.estadoId)}</td>
                  <td className="py-2 px-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => aoAbrirEdicao(cidade)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => aoDeletar(cidade.id)}>
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
              {cidadeEditando ? "Editar Cidade" : "Nova Cidade"}
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
            {!cidadeEditando && (
              <div>
                <Label>Estado</Label>
                <select
                  className="w-full border rounded px-3 py-1.5 text-sm"
                  value={formulario.estadoId}
                  onChange={(e) =>
                    setFormulario({ ...formulario, estadoId: Number(e.target.value) })
                  }
                >
                  <option value={0}>Selecione...</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nome} - {estado.uf}
                    </option>
                  ))}
                </select>
              </div>
            )}
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