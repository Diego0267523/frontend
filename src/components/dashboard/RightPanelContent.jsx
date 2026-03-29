import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

export default function RightPanelContent({
  loadingFood,
  dailyFoodEntries,
  handleDeleteFoodEntry,
  todayTotal,
  targetCalories,
  todayProtein,
  targetProtein,
  todayCarbs,
  todayFats,
  todayFiber,
  todaySodium,
  resetFoodForm,
  setFoodModalOpen,
}) {
  const weekly = [40, 60, 80, 50, 70, 90, 65];
  const days = ["L", "M", "X", "J", "V", "S", "D"];

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = Math.min((value / target) * 100, 100);

    return (
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
            {icon} {label}
          </Typography>
          <Typography sx={{ color: "#d7ffe9", fontSize: 13, fontWeight: 700 }}>
            {value} / {target} {unit}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 12,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: gradient,
              transition: "all 1s ease",
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 340,
        flexShrink: 0,
        p: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "linear-gradient(180deg, #0f0f0f 0%, #151515 100%)",
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": {
          background: "linear-gradient(180deg, #00ff88, #00c6ff)",
          borderRadius: 999,
        },
      }}
    >
      {/* 📊 Weekly calories */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          background: "rgba(30,30,30,0.72)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
            📊 Calorías semana
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              mt: 2,
              alignItems: "flex-end",
              height: 130,
            }}
          >
            {weekly.map((v, i) => (
              <Box key={i} sx={{ textAlign: "center" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: v }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                  style={{
                    width: 18,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #00ff88, #00c6ff)",
                    boxShadow: "0 0 16px rgba(0,255,136,0.25)",
                  }}
                />
                <Typography sx={{ color: "#888", fontSize: 10, mt: 0.8 }}>
                  {days[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      {/* 🍽️ Daily entries */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        sx={{
          background: "rgba(30,30,30,0.72)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 5,
        }}
      >
        <CardContent>
          <Typography
            sx={{ color: "#fff", fontWeight: 700, fontSize: 16, mb: 1.5 }}
          >
            🍽️ Entradas del día
          </Typography>

          {loadingFood ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} sx={{ color: "#00ff88" }} />
            </Box>
          ) : dailyFoodEntries.length === 0 ? (
            <Typography sx={{ color: "#777", fontSize: 12 }}>
              Aún no hay comidas registradas.
            </Typography>
          ) : (
            dailyFoodEntries.slice(0, 4).map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Box
                  sx={{
                    mb: 1,
                    p: 1.2,
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    transition: "0.25s",
                    "&:hover": {
                      transform: "translateX(4px)",
                      background: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ color: "#fff", fontSize: 12, fontWeight: 600 }}
                    >
                      {entry.descripcion || "Sin descripción"}
                    </Typography>
                    <Typography sx={{ color: "#9aa0a6", fontSize: 11 }}>
                      C: {entry.calorias} • P: {entry.proteina} • CH:{" "}
                      {entry.carbohidratos}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={() => handleDeleteFoodEntry(entry.id)}
                    size="small"
                    sx={{ color: "#ff5c5c" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </motion.div>
            ))
          )}
        </CardContent>
      </MotionCard>

      {/* 📊 Daily consumption */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          background: "rgba(30,30,30,0.72)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <CardContent>
          <Typography
            sx={{ color: "#fff", fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            📊 Consumo del Día
          </Typography>

          <StatProgress
            label="Calorías"
            value={todayTotal}
            target={targetCalories}
            unit="kcal"
            icon="🔥"
            gradient="linear-gradient(90deg, #00ff88, #00c6ff)"
          />

          <StatProgress
            label="Proteína"
            value={todayProtein}
            target={targetProtein}
            unit="g"
            icon="💪"
            gradient="linear-gradient(90deg, #00c6ff, #7b61ff)"
          />

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              🌾 Carbohidratos:{" "}
              <span style={{ color: "#ffd166" }}>{todayCarbs} g</span>
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5 }}>
            {[
              ["🥑", "Grasas", todayFats || 0, "g"],
              ["🥦", "Fibra", todayFiber || 0, "g"],
              ["🧂", "Sodio", todaySodium || 0, "mg"],
            ].map(([icon, label, val, unit]) => (
              <Box
                key={label}
                sx={{
                  flex: 1,
                  mx: 0.4,
                  p: 1,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 12 }}>
                  {icon} {label}
                </Typography>
                <Typography
                  sx={{ color: "#bbb", fontSize: 12, fontWeight: 700 }}
                >
                  {val} {unit}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              resetFoodForm();
              setFoodModalOpen(true);
            }}
            sx={{
              py: 1.4,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 14,
              color: "#08110d",
              background: "linear-gradient(90deg, #00ff88, #00c6ff)",
              boxShadow: "0 0 24px rgba(0,255,136,0.25)",
              transition: "0.25s",
              "&:hover": {
                boxShadow: "0 0 32px rgba(0,255,136,0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            🍽️ Registrar Comida
          </Button>
        </CardContent>
      </MotionCard>
    </Box>
  );
}