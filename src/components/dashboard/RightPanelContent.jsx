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
import { motion } from "framer-motion";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

function RightPanelContent({
  loadingFood,
  dailyFoodEntries = [],
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
  const safeDailyFoodEntries = Array.isArray(dailyFoodEntries)
    ? dailyFoodEntries
    : [];

  const weekly = useMemo(() => [40, 60, 80, 50, 70, 90, 65], []);
  const days = useMemo(() => ["L", "M", "X", "J", "V", "S", "D"], []);

  const premiumCardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 4,
    backdropFilter: "blur(18px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

  // 🔥 ANIMACIÓN GLOBAL TIPO SIDEBAR
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 15 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.35,
      },
    },
  };

  const StatProgress = ({ label, value, target, icon, gradient, unit = "" }) => {
    const percent = target ? Math.min((value / target) * 100, 100) : 0;

    return (
      <Box sx={{ mb: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography
              sx={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {label}
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: "#8bffcf",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
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
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="show"
      sx={{
        width: { xs: "100%", md: 340 },
        maxWidth: "100%",
        minHeight: "100dvh",
        flexShrink: 0,
        p: { xs: 1.5, md: 2 },
        pb: { xs: 10, md: 2 },
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background:
          "linear-gradient(180deg, rgba(14,14,14,0.98) 0%, rgba(20,20,20,0.95) 100%)",
        borderLeft: { md: "1px solid rgba(255,255,255,0.06)" },
        backdropFilter: "blur(18px)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* WEEKLY */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <TrendingUpRoundedIcon sx={{ color: "#00ff88" }} />
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: "-0.02em",
              }}
            >
              Calorías semana
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-end",
              height: 120,
            }}
          >
            {weekly.map((v, i) => (
              <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: v }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  style={{
                    width: 16,
                    margin: "0 auto",
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #00ff88, #00c6ff)",
                    boxShadow: "0 0 20px rgba(0,255,136,0.18)",
                  }}
                />
                <Typography
                  sx={{
                    color: "#8b949e",
                    fontSize: 10,
                    mt: 0.6,
                    fontWeight: 600,
                  }}
                >
                  {days[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      {/* FOOD ENTRIES */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <RestaurantRoundedIcon sx={{ color: "#00ff88" }} />
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              Entradas del día
            </Typography>
          </Stack>

          {loadingFood ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={22} sx={{ color: "#00ff88" }} />
            </Box>
          ) : safeDailyFoodEntries.length === 0 ? (
            <Typography sx={{ color: "#8b949e", fontSize: 12 }}>
              Aún no hay comidas registradas.
            </Typography>
          ) : (
            safeDailyFoodEntries.slice(0, 4).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
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
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {entry.descripcion || "Sin descripción"}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#8b949e",
                        fontSize: 11,
                      }}
                    >
                      C: {entry.calorias} • P: {entry.proteina} • CH:{" "}
                      {entry.carbohidratos}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={() => handleDeleteFoodEntry(entry.id)}
                    size="small"
                    sx={{
                      color: "#ff6b6b",
                      background: "rgba(255,255,255,0.04)",
                      "&:hover": {
                        background: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </motion.div>
            ))
          )}
        </CardContent>
      </MotionCard>

      {/* DAILY CONSUMPTION */}
      <MotionCard variants={cardVariants} sx={premiumCardStyle}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <TrendingUpRoundedIcon sx={{ color: "#00ff88" }} />
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              Consumo del Día
            </Typography>
          </Stack>

          <StatProgress
            label="Calorías"
            value={todayTotal}
            target={targetCalories}
            unit="kcal"
            icon={<LocalFireDepartmentRoundedIcon sx={{ color: "#00ff88" }} />}
            gradient="linear-gradient(90deg, #00ff88, #00c6ff)"
          />

          <StatProgress
            label="Proteína"
            value={todayProtein}
            target={targetProtein}
            unit="g"
            icon={<FitnessCenterRoundedIcon sx={{ color: "#00c6ff" }} />}
            gradient="linear-gradient(90deg, #00c6ff, #7b61ff)"
          />

          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <GrainRoundedIcon sx={{ color: "#ffd166" }} />
              <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                Carbohidratos:{" "}
                <span style={{ color: "#ffd166" }}>{todayCarbs} g</span>
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5 }}>
            {[
              [<WaterDropRoundedIcon sx={{ color: "#00c6ff" }} />, "Grasas", todayFats || 0, "g"],
              [<SpaRoundedIcon sx={{ color: "#00ff88" }} />, "Fibra", todayFiber || 0, "g"],
              [<WaterDropRoundedIcon sx={{ color: "#c084fc" }} />, "Sodio", todaySodium || 0, "mg"],
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
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background: "rgba(255,255,255,0.06)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
                  {icon}
                </Box>
                <Typography sx={{ color: "#fff", fontSize: 12 }}>{label}</Typography>
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
              transition: "all 0.25s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #00ff88, #00c6ff)",
                transform: "translateY(-1px)",
                boxShadow: "0 0 28px rgba(0,255,136,0.25)",
              },
            }}
          >
            Registrar Comida
          </Button>
        </CardContent>
      </MotionCard>
    </MotionBox>
  );
}

export default memo(RightPanelContent);