import React, { memo, useMemo } from "react";
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

function RightPanelContent({
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
  const weekly = useMemo(() => [40, 60, 80, 50, 70, 90, 65], []);
  const days = useMemo(() => ["L", "M", "X", "J", "V", "S", "D"], []);

  const premiumCardStyle = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.03)",
    borderRadius: 5,
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
  };

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = target ? Math.min((value / target) * 100, 100) : 0;

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
            height: 10,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: gradient,
              transition: "all 0.6s ease",
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 340 },
        maxWidth: "100%",
        flexShrink: 0,
        p: { xs: 1, md: 2 },
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "transparent",
        boxSizing: "border-box",
      }}
    >
      <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
            📊 Calorías semana
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "flex-end", height: 120 }}>
            {weekly.map((v, i) => (
              <Box key={i} sx={{ textAlign: "center" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: v }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  style={{
                    width: 16,
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #00ff88, #00c6ff)",
                  }}
                />
                <Typography sx={{ color: "#888", fontSize: 10, mt: 0.5 }}>
                  {days[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16, mb: 1.5 }}>
            🍽️ Entradas del día
          </Typography>

          {loadingFood ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={22} sx={{ color: "#00ff88" }} />
            </Box>
          ) : dailyFoodEntries.length === 0 ? (
            <Typography sx={{ color: "#777", fontSize: 12 }}>
              Aún no hay comidas registradas.
            </Typography>
          ) : (
            dailyFoodEntries.slice(0, 4).map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  mb: 1,
                  p: 1.2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.03)",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateX(2px)",
                    background: "rgba(255,255,255,0.04)",
                  },
                }}
              >
                <Box>
                  <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
                    {entry.descripcion || "Sin descripción"}
                  </Typography>
                  <Typography sx={{ color: "#9aa0a6", fontSize: 11 }}>
                    C: {entry.calorias} • P: {entry.proteina} • CH: {entry.carbohidratos}
                  </Typography>
                </Box>

                <IconButton onClick={() => handleDeleteFoodEntry(entry.id)} size="small" sx={{ color: "#ff5c5c" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </CardContent>
      </MotionCard>

      <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16, mb: 2 }}>
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
              🌾 Carbohidratos: <span style={{ color: "#ffd166" }}>{todayCarbs} g</span>
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
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 12 }}>
                  {icon} {label}
                </Typography>
                <Typography sx={{ color: "#bbb", fontSize: 12, fontWeight: 700 }}>
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
              py: 1.3,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: 14,
              color: "#08110d",
              background: "linear-gradient(90deg, #00ff88, #00c6ff)",
              transition: "0.2s",
              "&:hover": {
                transform: "translateY(-1px)",
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

export default memo(RightPanelContent);
