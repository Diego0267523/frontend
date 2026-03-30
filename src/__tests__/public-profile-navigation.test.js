import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createPublicProfile, addPostToProfile, publicProfilesDB } from "../utils/publicProfilesDB";
import PostCard from "../components/postCard";

// MOCK de useSocket para evitar dependencias reales
jest.mock("../context/SocketContext", () => ({
  useSocket: () => ({ socket: null, connected: false }),
}));

// MOCK de useAuth para test con user autenticado
jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ token: "fake-token", user: { id: "user_b", nombre: "Usuario B" } }),
}));

describe("Prueba E2E: perfil público desde PostCard", () => {
  beforeEach(() => {
    // Limpiar la base de datos mock y asegurar estado limpio
    Object.keys(publicProfilesDB).forEach((k) => delete publicProfilesDB[k]);
  });

  test("Usuario A se crea + Post A + Usuario B accede desde avatar/nombre", async () => {
    const profileA = createPublicProfile({
      nombre: "Usuario A",
      email: "usuario.a@example.com",
      username: "usuario.a",
      categoria: "Fitness",
    });

    const postA = addPostToProfile("usuario.a", {
      content: "Este es un post de Usuario A",
      image: "/img/post-a.jpg",
    });

    expect(profileA).toBeDefined();
    expect(profileA.username).toBe("usuario.a");
    expect(publicProfilesDB["usuario.a"]).toBeDefined();

    // Asegurar que el post tiene authorUsername/authorId
    expect(postA.authorUsername).toBe("usuario.a");
    expect(postA.authorId).toBe(profileA.id);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={<PostCard post={postA} />}
          />
          <Route
            path="/perfil/:username"
            element={<div data-testid="profile-page">Perfil público: {profileA.username}</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const avatar = screen.getByTestId("post-avatar");
    expect(avatar).toBeInTheDocument();

    fireEvent.click(avatar);

    await waitFor(() => {
      const profilePage = screen.queryByTestId("profile-page");
      expect(profilePage).toBeInTheDocument();
    });

    expect(window.location.pathname).toBe("/perfil/usuario.a");

    // Opción adicional: clic en username también funciona
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PostCard post={postA} />} />
          <Route path="/perfil/:username" element={<div data-testid="profile-page-2">OK</div>} />
        </Routes>
      </MemoryRouter>
    );

    const nameButton = screen.getByTestId("post-username-wrapper");
    fireEvent.click(nameButton);

    await waitFor(() => {
      expect(screen.getByTestId("profile-page-2")).toBeInTheDocument();
    });
  });
});