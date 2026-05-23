"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Linguagem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Paginacao from "@/components/shared/Paginacao";

const opcoesTipo = ["FrontEnd", "BackEnd", "Mobile", "Database", "DevOps"];

export default function PaginaLinguagens() {
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [linguagemEditando, setLinguagemEditando] = useState<Linguagem | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [formulario, setFormulario] = useState({ nome: "", tipo: "" });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const buscarLinguagens = async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroNome) parametros.append("nome", filtroNome);
      const resposta = await api.get(`/linguagens?${parametros}`);
      setLinguagens(resposta.data);
      setPaginaAtual(1);
    } catch {
      toast.error("Erro ao buscar linguagens.");
    }
  };

  useEffect(() => { buscarLinguagens(); }, []);

  const aoAbrirCriacao = () => {
    setLinguagemEditando(null);
    setFormulario({ nome: "", tipo: "" });
    setDialogoAberto(true);
  };

  const aoAbrirEdicao = (linguagem: Linguagem) => {
    setLinguagemEditando(linguagem);
    setFormulario({ nome: linguagem.nome, tipo: linguagem.tipo });
    setDialogoAberto(true);
  };

  const aoEnviarFormulario = async () => {
    try {
      setCarregando(true);
      const dados = {
        ...formulario,
        tipoLinguagem: opcoesTipo.indexOf(formulario.tipo),
      };
      if (linguagemEditando) {
        await api.put(`/linguagens/${linguagemEditando.id}`, {
          id: linguagemEditando.id,
          ...dados,
        });
        toast.success("Linguagem atualizada com sucesso!");
      } else {
        await api.post("/linguagens", dados);
        toast.success("Linguagem criada com sucesso!");
      }
      setDialogoAberto(false);
      buscarLinguagens();
    } catch (erro: any) {
      toast.error(erro.response?.data || "Erro ao salvar linguagem.");
    } finally {
      setCarregando(false);
    }
  };

  const aoDeletar = async (id: number) => {
    if (!confirm("Deseja deletar esta linguagem?")) return;
    try {
      await api.delete(`/linguagens/${id}`);
      toast.success("Linguagem deletada com sucesso!");
      buscarLinguagens();
    } catch {
      toast.error("Erro ao deletar linguagem.");
    }
  };

  const totalPaginas = Math.ceil(linguagens.length / itensPorPagina);
  const linguagensPaginadas = linguagens.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Linguagens</h1>
        <Button onClick={aoAbrirCriacao}>Nova Linguagem</Button>
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
              <Button onClick={buscarLinguagens}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Linguagens</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">Tipo</th>
                <th className="text-left py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {linguagensPaginadas.map((linguagem) => (
                <tr key={linguagem.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{linguagem.nome}</td>
                  <td className="py-2 px-4">{linguagem.tipo}</td>
                  <td className="py-2 px-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => aoAbrirEdicao(linguagem)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => aoDeletar(linguagem.id)}>
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
              {linguagemEditando ? "Editar Linguagem" : "Nova Linguagem"}
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
              <Label>Tipo</Label>
              <select
                className="w-full border rounded px-3 py-1.5 text-sm"
                value={formulario.tipo}
                onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
              >
                <option value="">Selecione...</option>
                {opcoesTipo.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
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