import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const ok = await login(username, password);

    if (!ok) {
      setError("Usuario o contraseña incorrectos");
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded w-80"
      >

        <h1 className="text-xl font-bold mb-4">
          Iniciar sesión
        </h1>

        <input
          placeholder="Usuario"
          className="border p-2 w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>

      </form>

    </div>
  );
}