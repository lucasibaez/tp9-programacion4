import {
  useRef,
} from "react";

import useFiltroFocus from "../hooks/useFiltroFocus";

type Props = {
  filtroNombre: string;
  setFiltroNombre: (valor: string) => void;

  filtroModalidad: string;
  setFiltroModalidad: (valor: string) => void;

  filtroNivel: string;
  setFiltroNivel: (valor: string) => void;

  limpiarFiltros: () => void;
};

export default function Filtros({
  filtroNombre,
  setFiltroNombre,
  filtroModalidad,
  setFiltroModalidad,
  filtroNivel,
  setFiltroNivel,
  limpiarFiltros,
}: Props) {

  // ======================================================
  // useRef
  // ======================================================

  const filtroRef =
    useRef<HTMLInputElement>(null);

  // ======================================================
  // CUSTOM HOOK
  // CTRL + B → foco búsqueda
  // ======================================================

  useFiltroFocus(filtroRef);

  return (

    <div className="bg-white shadow rounded p-6 mb-6 grid md:grid-cols-4 gap-4">

      {/* BUSCAR */}

      <input
        ref={filtroRef}
        placeholder="Buscar por nombre (Ctrl + B)"
        value={filtroNombre}
        onChange={(e) =>
          setFiltroNombre(e.target.value)
        }
        className="border p-2 rounded"
      />

      {/* MODALIDAD */}

      <select
        value={filtroModalidad}
        onChange={(e) =>
          setFiltroModalidad(e.target.value)
        }
        className="border p-2 rounded"
      >

        <option value="">
          Todas
        </option>

        <option>
          Presencial
        </option>

        <option>
          Virtual
        </option>

        <option>
          Híbrido
        </option>

      </select>

      {/* NIVEL */}

      <select
        value={filtroNivel}
        onChange={(e) =>
          setFiltroNivel(e.target.value)
        }
        className="border p-2 rounded"
      >

        <option value="">
          Todos
        </option>

        <option>
          Principiante
        </option>

        <option>
          Intermedio
        </option>

        <option>
          Avanzado
        </option>

      </select>

      {/* BOTÓN */}

      <button
        onClick={limpiarFiltros}
        className="bg-gray-500 text-white p-2 rounded"
      >

        Limpiar

      </button>

    </div>

  );

}