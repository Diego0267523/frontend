import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Box, Typography, Card, CardContent, Avatar } from "@mui/material";
import { motion } from "framer-motion";

function Profile() {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: "🔥 Racha", value: "7 días" },
    { label: "💪 Nivel", value: "Nivel 3" },
    { label: "🏋️ Entrenos", value: "24" },
    { label: "🔥 Calorías", value: "12,300 kcal" }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#0f0f0f", minHeight: "100vh" }}>

      {/* HEADER RESPONSIVE */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={4}
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" }
          }}
        >
          <Avatar sx={{ width: 70, height: 70, bgcolor: "#00ff88" }}>
            {user?.nombre?.[0] || "U"}
          </Avatar>

          <Box>
            <Typography sx={nameStyle}>
              {user?.nombre || "Usuario"}
            </Typography>

            <Typography sx={emailStyle}>
              {user?.email || "correo@email.com"}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* STATS RESPONSIVE */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)"
          },
          gap: 2
        }}
      >
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              scale: 1.05,
              y: -5
            }}
          >
            <Card sx={cardStyle}>
              <CardContent>
                <Typography sx={label}>{item.label}</Typography>
                <Typography sx={value}>{item.value}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* OBJETIVO */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card sx={{ ...cardStyle, mt: 3 }}>
          <CardContent>
            <Typography sx={label}>🎯 Objetivo actual</Typography>
            <Typography sx={value}>Definición</Typography>
          </CardContent>
        </Card>
      </motion.div>

    </Box>
  );
}

/* 🎨 STYLES */
const cardStyle = {
  bgcolor: "#121212",
  borderRadius: 3,
  boxShadow: "0 0 20px rgba(0,255,136,0.08)",
  transition: "0.3s",
  padding: {
    xs: 2,
    sm: 1
  },
  "&:hover": {
    boxShadow: "0 0 30px rgba(0,255,136,0.25)"
  }
};

const nameStyle = {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold"
};

const emailStyle = {
  color: "#aaa"
};

const label = {
  color: "#aaa",
  fontSize: 14
};

const value = {
  color: "#00ff88",
  fontSize: 20,
  fontWeight: "bold",
  mt: 1
};

export default Profile;