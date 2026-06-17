import {
  useState,
  useEffect,
  useRef,
  useId,
} from "react";

import type {
  FormEvent,
  ChangeEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { Participante } from "../models/Participante";

import { useParticipantes } from "../context/ParticipantesContext";

export default function Formularios() {

  const navigate = useNavigate();

  const {
    participantes,
    agregar,
    editar,
    editando,
    dispatch,
  } = useParticipantes();

  // ======================================================
  // useRef → foco automático
  // ======================================================

  const nombreInputRef =
    useRef<HTMLInputElement>(null);

  // ======================================================
  // useId → IDs accesibles
  // ======================================================

  const nombreId = useId();

  const emailId = useId();

  const edadId = useId();

  const paisId = useId();

  const nivelId = useId();

  const terminosId = useId();

  // ======================================================
  // FORM
  // ======================================================

  const [form, setForm] = useState({
    id: undefined as number | undefined,
    nombre: "",
    email: "",
    edad: "",
    pais: "Argentina",
    modalidad: "",
    tecnologias: [] as string[],
    nivel: "Principiante",
    aceptaTerminos: false,
  });

  // ======================================================
  // FOCUS AUTOMÁTICO
  // ======================================================

  useEffect(() => {

    nombreInputRef.current?.focus();

  }, []);

  // ======================================================
  // CARGAR EDICIÓN
  // ======================================================

  useEffect(() => {

    if (editando) {

      setForm({
        id: editando.id,
        nombre: editando.nombre,
        email: editando.email,
        edad: String(editando.edad),
        pais: editando.pais,
        modalidad: editando.modalidad,
        tecnologias: editando.tecnologias,
        nivel: editando.nivel,
        aceptaTerminos: editando.aceptaTerminos,
      });

    }

  }, [editando]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
      type,
    } = e.target;

    // CHECKBOX TECNOLOGÍAS
    if (
      type === "checkbox"
      &&
      name === "tecnologias"
    ) {

      const checked =
        (e.target as HTMLInputElement)
          .checked;

      let nuevas = [...form.tecnologias];

      if (checked) {

        nuevas.push(value);

      } else {

        nuevas = nuevas.filter(
          (t) => t !== value
        );

      }

      setForm({
        ...form,
        tecnologias: nuevas,
      });

    }

    // OTROS CHECKBOX
    else if (type === "checkbox") {

      const checked =
        (e.target as HTMLInputElement)
          .checked;

      setForm({
        ...form,
        [name]: checked,
      });

    }

    // INPUTS NORMALES
    else {

      setForm({
        ...form,
        [name]: value,
      });

    }

  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = (
    e: FormEvent
  ) => {

    e.preventDefault();

    // VALIDACIONES
    if (!form.nombre.trim()) {

      alert("El nombre es obligatorio");

      return;

    }

    if (!form.email.trim()) {

      alert("El email es obligatorio");

      return;

    }

    if (!form.email.includes("@")) {

      alert("Email inválido");

      return;

    }

    const existe =
      participantes.some(
        (p) =>
          p.email === form.email
          &&
          p.id !== form.id
      );

    if (existe) {

      alert("El email ya existe");

      return;

    }

    if (
      !form.edad
      ||
      Number(form.edad) <= 17
    ) {

      alert(
        "Edad inválida debe ser mayor de 18 años"
      );

      return;

    }

    if (
      !form.edad
      ||
      Number(form.edad) >= 100
    ) {

      alert("Edad inválida");

      return;

    }

    if (!form.modalidad) {

      alert("Seleccioná modalidad");

      return;

    }

    if (
      form.tecnologias.length === 0
    ) {

      alert(
        "Seleccioná al menos una tecnología"
      );

      return;

    }

    if (!form.aceptaTerminos) {

      alert(
        "Debés aceptar los términos"
      );

      return;

    }

    // CREAR OBJETO
    const nuevo =
      new Participante(
        editando
          ? editando.id
          : Date.now(),

        form.nombre,

        form.email,

        Number(form.edad),

        form.pais,

        form.modalidad,

        form.tecnologias,

        form.nivel,

        form.aceptaTerminos
      );

    // EDITAR
    if (editando) {

      editar(nuevo);

      dispatch({
        type: "SET_EDITANDO",
        payload: null,
      });

    }

    // AGREGAR
    else {

      agregar(nuevo);

    }

    // RESET
    setForm({
      id: undefined,
      nombre: "",
      email: "",
      edad: "",
      pais: "Argentina",
      modalidad: "",
      tecnologias: [],
      nivel: "Principiante",
      aceptaTerminos: false,
    });

    navigate("/");

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="grid gap-4"
    >

      {/* NOMBRE */}

      <div>

        <label
          htmlFor={nombreId}
          className="block mb-1"
        >

          Nombre

        </label>

        <input
          ref={nombreInputRef}
          id={nombreId}
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="border p-2 w-full rounded"
        />

      </div>

      {/* EMAIL */}

      <div>

        <label
          htmlFor={emailId}
          className="block mb-1"
        >

          Email

        </label>

        <input
          id={emailId}
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full rounded"
        />

      </div>

      {/* EDAD */}

      <div>

        <label
          htmlFor={edadId}
          className="block mb-1"
        >

          Edad

        </label>

        <input
          id={edadId}
          name="edad"
          type="number"
          value={form.edad}
          onChange={handleChange}
          placeholder="Edad"
          className="border p-2 w-full rounded"
        />

      </div>

      {/* PAÍS */}

      <div>

        <label
          htmlFor={paisId}
          className="block mb-1"
        >

          País

        </label>

        <select
          id={paisId}
          name="pais"
          value={form.pais}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >

          <option>
            Argentina
          </option>

          <option>
            Chile
          </option>

          <option>
            Uruguay
          </option>

        </select>

      </div>

      {/* MODALIDAD */}

      <div>

        <p className="mb-1 font-medium">
          Modalidad
        </p>

        {
          ["Presencial", "Virtual", "Híbrido"]
            .map((m) => {

              const id = useId();

              return (

                <label
                  key={m}
                  htmlFor={id}
                  className="mr-4"
                >

                  <input
                    id={id}
                    type="radio"
                    name="modalidad"
                    value={m}
                    checked={
                      form.modalidad === m
                    }
                    onChange={handleChange}
                  />

                  {" "}

                  {m}

                </label>

              );

            })
        }

      </div>

      {/* TECNOLOGÍAS */}

      <div>

        <p className="mb-1 font-medium">
          Tecnologías
        </p>

        {
          ["React", "Angular", "Vue"]
            .map((t) => {

              const id = useId();

              return (

                <label
                  key={t}
                  htmlFor={id}
                  className="mr-4"
                >

                  <input
                    id={id}
                    type="checkbox"
                    name="tecnologias"
                    value={t}
                    checked={
                      form.tecnologias.includes(t)
                    }
                    onChange={handleChange}
                  />

                  {" "}

                  {t}

                </label>

              );

            })
        }

      </div>

      {/* NIVEL */}

      <div>

        <label
          htmlFor={nivelId}
          className="block mb-1"
        >

          Nivel

        </label>

        <select
          id={nivelId}
          name="nivel"
          value={form.nivel}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >

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

      </div>

      {/* TÉRMINOS */}

      <label htmlFor={terminosId}>

        <input
          id={terminosId}
          type="checkbox"
          name="aceptaTerminos"
          checked={form.aceptaTerminos}
          onChange={handleChange}
        />

        {" "}

        Acepto términos

      </label>

      {/* BOTÓN */}

      <button
        className="bg-blue-500 text-white p-2 rounded"
      >

        {
          editando
            ? "Actualizar"
            : "Registrar"
        }

      </button>

    </form>

  );

}