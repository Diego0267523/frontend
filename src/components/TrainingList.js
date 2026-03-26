import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../utils/config";

import {
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Box
} from "@mui/material";

function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    console.log("🚀 Cargando entrenamientos...");

    fetch(`${API_URL}/api/training/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 RESPUESTA BACKEND:", data);

        setTrainings(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("❌ Error:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      
      <Typography
        variant="h5"
        gutterBottom
        style={{
          color: "#00ff88",
          fontWeight: "bold",
          letterSpacing: "1px"
        }}
      >
        🏋️ Tus Entrenamientos
      </Typography>

      {/* LOADING */}
      {loading && (
        <Box display="flex" justifyContent="center" marginTop={5}>
          <CircularProgress style={{ color: "#00ff88" }} />
        </Box>
      )}

      {/* VACÍO */}
      {!loading && trainings.length === 0 && (
        <Typography style={{ color: "#aaa", textAlign: "center", marginTop: "30px" }}>
          No hay entrenamientos todavía... 💭
        </Typography>
      )}

      {/* LISTA */}
      {trainings.map((t, index) => (
        <Card
          key={t.id || index}
          style={{
            marginTop: "15px",
            borderRadius: "16px",
            background: "#121212",
            boxShadow: "0 0 20px rgba(0,255,136,0.08)",
            border: "1px solid #1f1f1f"
          }}
        >
          <CardContent>

            {/* FECHA */}
            <Typography
              variant="h6"
              style={{
                color: "#00ff88",
                marginBottom: "10px"
              }}
            >
              📅 {t.fecha
                ? new Date(t.fecha).toLocaleDateString()
                : "Sin fecha"}
            </Typography>

            {/* SERIES */}
            {t.series?.length > 0 ? (
              <Box display="flex" flexDirection="column" gap="6px">
                {t.series.map((s, i) => (
                  <Box
                    key={i}
                    style={{
                      background: "#1a1a1a",
                      padding: "10px",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Typography style={{ color: "#fff" }}>
                      {s.ejercicio}
                    </Typography>

                    <Typography style={{ color: "#aaa", fontSize: "14px" }}>
                      {s.peso}kg × {s.repeticiones}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography style={{ color: "#666" }}>
                Sin series
              </Typography>
            )}

          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default TrainingList;