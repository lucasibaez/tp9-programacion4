import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

import type { ReactNode } from "react";
import { Participante } from "../models/Participante";
import { participantesReducer } from "../reducers/participantesReducer";
import type { Action } from "../reducers/participantesReducer";
import { useAuth } from "./AuthContext";

interface ContextType {
  participantes: Participante[];
  editando: Participante | null;
  dispatch: React.Dispatch<Action>;
  agregar: (p: Participante) => void;
  eliminar: (id: number) => void;
  editar: (p: Participante) => void;
  resetear: () => void;
}

const ParticipantesContext = createContext<ContextType | undefined>(undefined);

export const ParticipantesProvider = ({ children }: { children: ReactNode }) => {

  const { token } = useAuth();

  const [state, dispatch] = useReducer(participantesReducer, {
    participantes: [],
    editando: null,
  });

  // ======================================================
  // GET (JWT SEGURO)
  // ======================================================
  useEffect(() => {

    const storedToken = token || localStorage.getItem("token");

    if (!storedToken) return;

    fetch("http://localhost:8000/participantes", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar participantes");
        return res.json();
      })
      .then((data) =>
        dispatch({
          type: "SET",
          payload: data,
        })
      )
      .catch(console.error);

  }, [token]);

  // ======================================================
  // AGREGAR
  // ======================================================
  const agregar = (p: Participante) => {

    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) return;

    fetch("http://localhost:8000/participantes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify(p),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al agregar");
        return res.json();
      })
      .then((nuevo) =>
        dispatch({
          type: "AGREGAR",
          payload: nuevo,
        })
      )
      .catch(console.error);
  };

  // ======================================================
  // ELIMINAR
  // ======================================================
  const eliminar = (id: number) => {

    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) return;

    fetch(`http://localhost:8000/participantes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
      })
      .then(() =>
        dispatch({
          type: "ELIMINAR",
          payload: id,
        })
      )
      .catch(console.error);
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const editar = (p: Participante) => {

    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) return;

    fetch(`http://localhost:8000/participantes/${p.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify(p),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al editar");
        return res.json();
      })
      .then((actualizado) =>
        dispatch({
          type: "EDITAR",
          payload: actualizado,
        })
      )
      .catch(console.error);
  };

  // ======================================================
  // RESET
  // ======================================================
  const resetear = () => {
    dispatch({
      type: "RESET",
      payload: [],
    });
  };

  return (
    <ParticipantesContext.Provider
      value={{
        participantes: state.participantes,
        editando: state.editando,
        dispatch,
        agregar,
        eliminar,
        editar,
        resetear,
      }}
    >
      {children}
    </ParticipantesContext.Provider>
  );
};

export const useParticipantes = () => {
  const context = useContext(ParticipantesContext);

  if (!context) {
    throw new Error("Error de contexto");
  }

  return context;
};