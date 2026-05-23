interface PropsPaginacao {
  paginaAtual: number;
  totalPaginas: number;
  aoMudarPagina: (pagina: number) => void;
}

export default function Paginacao({
  paginaAtual,
  totalPaginas,
  aoMudarPagina,
}: PropsPaginacao) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => aoMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
      >
        Anterior
      </button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
        <button
          key={pagina}
          onClick={() => aoMudarPagina(pagina)}
          className={`px-3 py-1 rounded border text-sm ${
            pagina === paginaAtual
              ? "bg-gray-900 text-white border-gray-900"
              : "hover:bg-gray-100"
          }`}
        >
          {pagina}
        </button>
      ))}

      <button
        onClick={() => aoMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
      >
        Próximo
      </button>
    </div>
  );
}