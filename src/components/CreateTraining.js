import React, { useState } from "react";
import API_URL from "../config";

function CreateTraining() {
  const [ejercicio, setEjercicio] = useState("");
  const [peso, setPeso] = useState("");
  const [repeticiones, setRepeticiones] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/training/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
  fecha: new Date(), // o input si quieres
  series: [
    {
      ejercicio,
      peso: Number(peso),
      repeticiones: Number(repeticiones)
    }
  ]
}),
    });

    const data = await res.json();
    console.log(data);

    alert(data.message || "Entrenamiento guardado");

    setEjercicio("");
    setPeso("");
    setRepeticiones("");
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <h2>💪 Crear entrenamiento</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Ejercicio"
          value={ejercicio}
          onChange={(e) => setEjercicio(e.target.value)}
        />

        <input
          placeholder="Peso"
          type="number"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />

        <input
          placeholder="Repeticiones"
          type="number"
          value={repeticiones}
          onChange={(e) => setRepeticiones(e.target.value)}
        />

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}

export default CreateTraining;