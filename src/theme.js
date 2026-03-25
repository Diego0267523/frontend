import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ff88",
    },
    background: {
      default: "#0f0f0f",
      paper: "#121212",
    },
    text: {
      primary: "#ffffff",
      secondary: "#aaaaaa",
    },
  },

  typography: {
    fontFamily: "Inter, Arial, sans-serif",
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f0f0f",
        },
      },
    },
  },
});

export default theme;