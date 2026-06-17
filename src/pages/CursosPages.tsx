import useTituloPagina from "../hooks/useTituloPagina";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Cursos() {

  useTituloPagina("Cursos");

  const [compraExitosa, setCompraExitosa] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // DETECCIÓN DE RETORNO DE MERCADO PAGO
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      setCompraExitosa(true);
      alert(" Pago aprobado - curso comprado correctamente");
    }

    if (status === "failure") {
      alert(" El pago fue rechazado");
    }

    if (status === "pending") {
      alert(" Pago pendiente");
    }

   
    if (status) {
      window.history.replaceState({}, document.title, "/cursos");
    }

  }, []);

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  const cursos = [
    { id: 1, nombre: "Curso React", precio: 250 },
    { id: 2, nombre: "Curso DBA", precio: 400 },
    { id: 3, nombre: "Curso SQL", precio: 300 },
    { id: 4, nombre: "Curso Python", precio: 350 },
    { id: 5, nombre: "Curso Ciberseguridad", precio: 500 },
    { id: 6, nombre: "Curso Java", precio: 280 },
  ];

  const comprarCurso = async (nombre: string, precio: number) => {

    console.log("BOTON FUNCIONA");

    try {

      console.log("ANTES DEL FETCH");

      const response = await fetch(
        "http://127.0.0.1:8000/crear-preferencia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: nombre,
            precio: precio,
          }),
        }
      );

      console.log("STATUS:", response.status);

      const text = await response.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);
      console.log("DATA:", data);

      if (!data?.init_point) {
        alert("Error: no se pudo generar el link de pago");
        return;
      }

      window.location.href = data.init_point;

    } catch (error) {
      console.error("ERROR:", error);
      alert("Error al conectar con Mercado Pago");
    }

  };

  return (
    <div className="p-6">

      {/*  TARJETA DE COMPRA EXITOSA */}
      {compraExitosa && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded mb-4 flex justify-between items-center">
          <span>🎉 Curso comprado correctamente</span>

          <button
            onClick={cerrarSesion}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">
        Cursos Disponibles
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        {cursos.map((curso) => (

          <div
            key={curso.id}
            className="bg-white rounded-lg shadow p-4"
          >

            <h2 className="text-xl font-semibold mb-2">
              {curso.nombre}
            </h2>

            <p className="text-gray-700 mb-4">
              Precio: ${curso.precio}
            </p>

            <button
              onClick={() => comprarCurso(curso.nombre, curso.precio)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              QUIERO ESTE CURSO
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}