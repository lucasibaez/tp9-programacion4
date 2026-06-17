import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import { useParticipantes } from "../context/ParticipantesContext";
import ParticipanteCard from "../components/ParticipanteCard";
import Filtros from "../components/Filtros";
import useTituloPagina from "../hooks/useTituloPagina";

export default function HomePage() {

  useTituloPagina("Lista de Participantes");

  const { participantes } = useParticipantes();

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  //estado compra
  const [compraExitosa, setCompraExitosa] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      setCompraExitosa(true);
    }

    if (status) {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroModalidad("");
    setFiltroNivel("");
  };

  const participantesFiltrados = participantes.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      (filtroModalidad === "" || p.modalidad === filtroModalidad) &&
      (filtroNivel === "" || p.nivel === filtroNivel)
    );
  });

  return (
    <div className="p-6">

      {/*  CARTEL DE COMPRA */}
      {compraExitosa && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded mb-4 flex justify-between items-center">
          🎉 Curso comprado correctamente

          <button
            onClick={cerrarSesion}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Participantes
        </h1>

        <div className="flex gap-3">

          <Link
            to="/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Nuevo participante
          </Link>

          {user?.rol === "CONSULTA" && (
            <Link
              to="/cursos"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Ir a Cursos
            </Link>
          )}

        </div>

      </div>

      <Filtros
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroModalidad={filtroModalidad}
        setFiltroModalidad={setFiltroModalidad}
        filtroNivel={filtroNivel}
        setFiltroNivel={setFiltroNivel}
        limpiarFiltros={limpiarFiltros}
      />

      <div className="grid md:grid-cols-3 gap-4 mt-4">

        {participantesFiltrados.map((p) => (
          <ParticipanteCard
            key={p.id}
            participante={p}
          />
        ))}

      </div>

    </div>
  );
}