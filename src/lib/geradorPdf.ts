import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Desenvolvedor } from "@/types";

export const gerarPdfDesenvolvedor = (dev: Desenvolvedor, nomeCidade: string, nomeEstado: string) => {
  const documento = new jsPDF();

  documento.setFontSize(18);
  documento.text("Relatório de Desenvolvedor", 14, 20);

  documento.setLineWidth(0.5);
  documento.line(14, 25, 196, 25);

  documento.setFontSize(12);
  documento.text(`Nome: ${dev.nome}`, 14, 35);
  documento.text(`E-mail: ${dev.email}`, 14, 43);
  documento.text(`Senioridade: ${dev.senioridade}`, 14, 51);
  documento.text(`Cidade: ${nomeCidade} - ${nomeEstado}`, 14, 59);

  if (dev.observacoes) {
    documento.text(`Observações: ${dev.observacoes}`, 14, 67);
  }

  documento.setFontSize(14);
  documento.text("Linguagens", 14, 82);

  autoTable(documento, {
    startY: 87,
    head: [["Nome", "Tipo"]],
    body: dev.linguagens.map((l) => [l.nome, l.tipo]),
    theme: "striped",
    headStyles: { fillColor: [30, 30, 30] },
  });

  const totalPaginas = documento.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    documento.setPage(i);
    documento.setFontSize(9);
    documento.setTextColor(150);
    documento.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} - Página ${i} de ${totalPaginas}`,
      14,
      documento.internal.pageSize.height - 10
    );
  }

  documento.save(`desenvolvedor-${dev.nome.toLowerCase().replace(/ /g, "-")}.pdf`);
};