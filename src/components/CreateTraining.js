import React, { useState } from "react";
import API_URL from "../utils/config";

function CreateTraining() {
  const [ejercicio, setEjercicio] = useState("");
  const [peso, setPeso] = useState("");
  const [repeticiones, setRepeticiones] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🔥 VALIDACIONES
    if (!ejercicio || !peso || !repeticiones) {
      setError("Completa todos los campos ⚠️");
      return;
    }

    if (Number(peso) <= 0 || Number(repeticiones) <= 0) {
      setError("Peso y repeticiones deben ser mayores a 0 ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/training/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 IMPORTANTE
        },
        body: JSON.stringify({
          fecha: new Date(),
          series: [
            {
              ejercicio,
              peso: Number(peso),
              repeticiones: Number(repeticiones),
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al guardar ❌");
        return;
      }

      alert("Entrenamiento guardado 💪");

      // 🔄 limpiar campos
      setEjercicio("");
      setPeso("");
      setRepeticiones("");

    } catch (err) {
      setError("Error de conexión 🚨");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💪 Crear entrenamiento</h2>

      {/* 🔥 ERROR */}
      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Ejercicio (ej: Press banca)"
          value={ejercicio}
          onChange={(e) => setEjercicio(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Peso (kg)"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Repeticiones"
          type="number"
          value={repeticiones}
          onChange={(e) => setRepeticiones(e.target.value)}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar entrenamiento"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#121212",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 0 20px rgba(0,255,136,0.08)",
    marginTop: "10px",
  },
  title: {
    color: "#00ff88",
    marginBottom: "15px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#00ff88",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s",
  },
};

export default CreateTraining;