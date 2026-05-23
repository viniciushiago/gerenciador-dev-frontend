"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const itensMenu = [
  { rotulo: "Desenvolvedores", caminho: "/desenvolvedores" },
  { rotulo: "Estados", caminho: "/estados" },
  { rotulo: "Cidades", caminho: "/cidades" },
  { rotulo: "Linguagens", caminho: "/linguagens" },
];

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const roteador = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      roteador.push("/login");
    }
  }, [roteador]);

  const aoSair = () => {
    localStorage.removeItem("token");
    roteador.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-screen">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-lg font-semibold">Gerenciador de Devs</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {itensMenu.map((item) => (
            <Link
              key={item.caminho}
              href={item.caminho}
              className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={aoSair}
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}