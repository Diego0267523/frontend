import React from "react";
import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";

/**
 * 🎬 ProfessionalLoader - Loader de nivel empresarial
 * Utilizado durante cargas iniciales y estados de espera
 */
function ProfessionalLoader({ message = "Cargando..." }) {
  const spinners = [
    { delay: 0, size: 60 },
    { delay: 0.2, size: 45 },
    { delay: 0.4, size: 30 }
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Fondo animado de gradiente */}
      <motion.div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)",
          top: "-200px",
          left: "-200px"
        }}
        animate={{
          y: [0, 20, 0],
          x: [0, 10, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Spinner principal con capas */}
      <Box
        sx={{
          position: "relative",
          width: 120,
          height: 120,
          zIndex: 1,
          mb: 3
        }}
      >
        {spinners.map((spinner, idx) => (
          <motion.div
            key={idx}
            style={{
              position: "absolute",
              inset: "50%",
              width: spinner.size,
              height: spinner.size,
              marginLeft: -spinner.size / 2,
              marginTop: -spinner.size / 2,
              border: "2px solid transparent",
              borderTopColor: `rgba(0, 255, 136, ${1 - idx * 0.3})`,
              borderRightColor: `rgba(0, 191, 165, ${1 - idx * 0.3})`,
              borderRadius: "50%"
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2 + idx * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: spinner.delay
            }}
          />
        ))}

        {/* Punto central */}
        <motion.div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            background: "linear-gradient(135deg, #00ff88 0%, #00bfa5 100%)",
            borderRadius: "50%",
            inset: "50%",
            marginLeft: -6,
            marginTop: -6,
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.6)"
          }}
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 20px rgba(0, 255, 136, 0.6)",
              "0 0 40px rgba(0, 255, 136, 1)",
              "0 0 20px rgba(0, 255, 136, 0.6)"
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Box>

      {/* Texto principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#fff",
            fontWeight: 600,
            letterSpacing: 1,
            textAlign: "center",
            mb: 1
          }}
        >
          {message}
        </Typography>
      </motion.div>

      {/* Indicador de progreso con puntos animados */}
      <motion.div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "24px",
          zIndex: 1
        }}
      >
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00ff88, #00bfa5)"
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1.5,
              delay: dot * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Subtexto descriptivo */}
      <motion.div
        style={{ marginTop: "32px", zIndex: 1 }}
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            fontSize: "0.875rem"
          }}
        >
          Preparando tu experiencia...
        </Typography>
      </motion.div>
    </Box>
  );
}

export default ProfessionalLoader;
