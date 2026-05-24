"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Desenvolvedor, Linguagem, Cidade, Estado } from "@/types";
import Paginacao from "@/components/shared/Paginacao";
import { gerarPdfDesenvolvedor } from "@/lib/geradorPdf";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaginaDesenvolvedores() {
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [linguagens, setLinguagens] = useState<Linguagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [devEditando, setDevEditando] = useState<Desenvolvedor | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroSenioridade, setFiltroSenioridade] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senioridade: "",
    cidadeId: 0,
    observacoes: "",
    linguagensId: [] as number[],
  });

  const mapaSenioridade: Record<string, number> = {
    Junior: 0,
    Pleno: 1,
    Senior: 2,
  };

  const opcoesSenioridade = ["Junior", "Pleno", "Senior"];

  const buscarDesenvolvedores = async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroNome) parametros.append("nome", filtroNome);
      if (filtroSenioridade) parametros.append("senioridade", filtroSenioridade);

      const resposta = await api.get(`/desenvolvedores?${parametros}`);
      setDesenvolvedores(resposta.data);
      setPaginaAtual(1);
    } catch {
      toast.error("Erro ao buscar desenvolvedores.");
    }
  };

  const buscarEstados = async () => {
    const resposta = await api.get("/estados");
    setEstados(resposta.data);
  };

  const buscarCidades = async () => {
    const resposta = await api.get("/cidades");
    setCidades(resposta.data);
  };

  const aoGerarPdf = (dev: Desenvolvedor) => {
    const cidade = cidades.find((c) => c.id === dev.cidadeId);
    const estado = estados.find((e) => e.id === cidade?.estadoId);
    gerarPdfDesenvolvedor(dev, cidade?.nome || "-", estado?.nome || "-");
  };

  const buscarLinguagens = async () => {
    const resposta = await api.get("/linguagens");
    setLinguagens(resposta.data);
  };

  useEffect(() => {
    buscarDesenvolvedores();
    buscarCidades();
    buscarLinguagens();
    buscarEstados();
  }, []);

  const aoAbrirCriacao = () => {
    setDevEditando(null);
    setFormulario({
      nome: "",
      email: "",
      senioridade: "",
      cidadeId: 0,
      observacoes: "",
      linguagensId: [],
    });
    setDialogoAberto(true);
  };

  const aoAbrirEdicao = (dev: Desenvolvedor) => {
    setDevEditando(dev);
    setFormulario({
      nome: dev.nome,
      email: dev.email,
      senioridade: dev.senioridade,
      cidadeId: dev.cidadeId,
      observacoes: dev.observacoes || "",
      linguagensId: dev.linguagens.map((l) => l.id),
    });
    setDialogoAberto(true);
  };

  const aoEnviarFormulario = async () => {
    try {
      setCarregando(true);
      const dados = {
        ...formulario,
        senioridade: mapaSenioridade[formulario.senioridade],
      };

      if (devEditando) {
        await api.put(`/desenvolvedores/${devEditando.id}`, {
          id: devEditando.id,
          ...dados,
        });
        toast.success("Desenvolvedor atualizado com sucesso!");
      } else {
        await api.post("/desenvolvedores", dados);
        toast.success("Desenvolvedor criado com sucesso!");
      }
      setDialogoAberto(false);
      buscarDesenvolvedores();
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
    if (!confirm("Deseja deletar este desenvolvedor?")) return;
    try {
      await api.delete(`/desenvolvedores/${id}`);
      toast.success("Desenvolvedor deletado com sucesso!");
      buscarDesenvolvedores();
    } catch {
      toast.error("Erro ao deletar desenvolvedor.");
    }
  };

  const aoAlternarLinguagem = (id: number) => {
    setFormulario((anterior) => ({
      ...anterior,
      linguagensId: anterior.linguagensId.includes(id)
        ? anterior.linguagensId.filter((l) => l !== id)
        : [...anterior.linguagensId, id],
    }));
  };

  const totalPaginas = Math.ceil(desenvolvedores.length / itensPorPagina);
  const desenvolvedoresPaginados = desenvolvedores.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Desenvolvedores</h1>
        <Button onClick={aoAbrirCriacao}>Novo Desenvolvedor</Button>
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
            <div className="flex-1">
              <Label>Senioridade</Label>
              <select
                className="w-full border rounded px-3 py-1.5 text-sm"
                value={filtroSenioridade}
                onChange={(e) => setFiltroSenioridade(e.target.value)}
              >
                <option value="">Todas</option>
                {opcoesSenioridade.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={buscarDesenvolvedores}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Desenvolvedores</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">E-mail</th>
                <th className="text-left py-2 px-4">Senioridade</th>
                <th className="text-left py-2 px-4">Linguagens</th>
                <th className="text-left py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {desenvolvedoresPaginados.map((dev) => (
                <tr key={dev.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{dev.nome}</td>
                  <td className="py-2 px-4">{dev.email}</td>
                  <td className="py-2 px-4">{dev.senioridade}</td>
                  <td className="py-2 px-4">
                    {dev.linguagens.map((l) => l.nome).join(", ")}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => aoAbrirEdicao(dev)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => aoDeletar(dev.id)}
                    >
                      Deletar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => aoGerarPdf(dev)}
                    >
                      PDF
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
              {devEditando ? "Editar Desenvolvedor" : "Novo Desenvolvedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formulario.nome}
                onChange={(e) =>
                  setFormulario({ ...formulario, nome: e.target.value })
                }
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formulario.email}
                onChange={(e) =>
                  setFormulario({ ...formulario, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Senioridade</Label>
              <select
                className="w-full border rounded px-3 py-1.5 text-sm"
                value={formulario.senioridade}
                onChange={(e) =>
                  setFormulario({ ...formulario, senioridade: e.target.value })
                }
              >
                <option value="">Selecione...</option>
                {opcoesSenioridade.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Cidade</Label>
              <select
                className="w-full border rounded px-3 py-1.5 text-sm"
                value={formulario.cidadeId}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    cidadeId: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Selecione...</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                value={formulario.observacoes}
                onChange={(e) =>
                  setFormulario({ ...formulario, observacoes: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Linguagens</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {linguagens.map((linguagem) => (
                  <button
                    key={linguagem.id}
                    type="button"
                    onClick={() => aoAlternarLinguagem(linguagem.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${formulario.linguagensId.includes(linguagem.id)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                      }`}
                  >
                    {linguagem.nome}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogoAberto(false)}
              >
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