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
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 4,
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  };

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = target ? Math.min((value / target) * 100, 100) : 0;

    return (
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
            {icon} {label}
          </Typography>
          <Typography sx={{ color: "#8bffcf", fontSize: 13, fontWeight: 700 }}>
            {value} / {target} {unit}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: gradient,
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
        background:
          "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Weekly */}
      <MotionCard sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
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
                    boxShadow: "0 0 12px rgba(0,255,136,0.15)",
                  }}
                />
                <Typography sx={{ color: "#8b949e", fontSize: 10, mt: 0.5 }}>
                  {days[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      {/* Food entries */}
      <MotionCard sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16, mb: 1.5 }}>
            🍽️ Entradas del día
          </Typography>

          {loadingFood ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={22} sx={{ color: "#00ff88" }} />
            </Box>
          ) : dailyFoodEntries.length === 0 ? (
            <Typography sx={{ color: "#8b949e", fontSize: 12 }}>
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
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.06)",
                  },
                }}
              >
                <Box>
                  <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    {entry.descripcion || "Sin descripción"}
                  </Typography>
                  <Typography sx={{ color: "#8b949e", fontSize: 11 }}>
                    C: {entry.calorias} • P: {entry.proteina} • CH: {entry.carbohidratos}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => handleDeleteFoodEntry(entry.id)}
                  size="small"
                  sx={{ color: "#ff6b6b" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </CardContent>
      </MotionCard>

      {/* Daily consumption */}
      <MotionCard sx={premiumCardStyle}>
        <CardContent>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16, mb: 2 }}>
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
            <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
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
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 12 }}>
                  {icon} {label}
                </Typography>
                <Typography sx={{ color: "#8b949e", fontSize: 12, fontWeight: 700 }}>
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
              boxShadow: "0 0 20px rgba(0,255,136,0.18)",
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