import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      // 💾 guardar token en localStorage
      localStorage.setItem("token", data.token);

      // 🔐 contexto global
      login(data.token);

      alert("Login exitoso 🔥");
    } else {
      alert(data.message || "Error en login");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>🔐 Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;