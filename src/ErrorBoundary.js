import React from "react";
import { Box, Typography, Button } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 ERROR BOUNDARY CAUGHT:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "#000",
            p: 3,
            textAlign: "center"
          }}
        >
          <Typography sx={{ color: "#ff4444", fontSize: 24, fontWeight: "bold", mb: 2 }}>
            ⚠️ Algo salió mal
          </Typography>
          <Typography sx={{ color: "#aaa", mb: 3 }}>
            {this.state.error?.message || "Error inesperado"}
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleReset}
            sx={{ bgcolor: "#00ff88", color: "#000", fontWeight: "bold" }}
          >
            Volver al inicio
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
