import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

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
      
      <Typography variant="h5" gutterBottom>
        🏋️ Tus Entrenamientos
      </Typography>

      {/* LOADING */}
      {loading && (
        <Box display="flex" justifyContent="center" marginTop={3}>
          <CircularProgress />
        </Box>
      )}

      {/* VACÍO */}
      {!loading && trainings.length === 0 && (
        <Typography>No hay entrenamientos todavía...</Typography>
      )}

      {/* LISTA */}
      {trainings.map((t, index) => (
        <Card
          key={t.id || index}
          style={{
            marginTop: "15px",
            borderRadius: "15px",
            boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>

            <Typography variant="h6">
              📅 {t.fecha
                ? new Date(t.fecha).toLocaleDateString()
                : "Sin fecha"}
            </Typography>

            {/* SERIES */}
            {t.series?.length > 0 ? (
              t.series.map((s, i) => (
                <Typography key={i} style={{ marginLeft: "10px" }}>
                  👉 {s.ejercicio} - {s.peso}kg x {s.repeticiones}
                </Typography>
              ))
            ) : (
              <Typography style={{ marginLeft: "10px" }}>
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