import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import TrainingList from "./components/TrainingList";
import CreateTraining from "./components/CreateTraining";
import ChatAssistant from "./components/ChatAssistant"; // 🔥 IMPORTANTE

import { AuthContext } from "./context/AuthContext";

function Home() {
  const { logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Mi Gym 💪</h1>

      <button onClick={logout}>Logout</button>

      {/* 🔥 ENTRENAMIENTOS */}
      <CreateTraining />
      <TrainingList />

      {/* 🔥 CHAT IA */}
      <ChatAssistant />
    </div>
  );
}

function App() {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route
              path="/"
              element={
                <div style={{ textAlign: "center" }}>
                  <h1>Bienvenido al Gym 💪</h1>

                  <Link to="/login">
                    <button>Iniciar sesión</button>
                  </Link>

                  <Link to="/register">
                    <button style={{ marginLeft: "10px" }}>
                      Registrarse
                    </button>
                  </Link>
                </div>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        ) : (
          <Route path="/*" element={<Home />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;