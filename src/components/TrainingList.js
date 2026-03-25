import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

function TrainingList() {
  const [trainings, setTrainings] = useState([]);

  const { token } = useContext(AuthContext);
  // 🔥 TU TOKEN
  

  useEffect(() => {
    console.log("🚀 Cargando entrenamientos...");

    fetch(`${API_URL}/api/training/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ FIX IMPORTANTE AQUÍ
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 RESPUESTA BACKEND:", data);

        // 👇 proteger si no es array
        setTrainings(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => {
        console.log("❌ Error:", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏋️ Entrenamientos</h2>

      {/* si no hay datos */}
      {trainings.length === 0 && <p>No hay entrenamientos todavía...</p>}

      {/* lista de entrenamientos */}
      {trainings.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid gray",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>
            📅 {t.fecha ? new Date(t.fecha).toLocaleDateString() : "Sin fecha"}
          </h3>

          {/* series seguras */}
          {t.series?.length > 0 ? (
            t.series.map((s, i) => (
              <p key={i}>
                👉 {s.ejercicio} - {s.peso}kg x {s.repeticiones}
              </p>
            ))
          ) : (
            <p>Sin series</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default TrainingList;