/**
 * 📊 DATOS MOCKUP DE USUARIOS
 * Sistema de perfiles simulado para desarrollo y pruebas
 */

export const mockUsersData = [
  {
    id: 1,
    username: "diego-camacho",
    nombre: "Diego Camacho",
    email: "diego@example.com",
    bio: "🏋️ Fitness enthusiast | Gym lover | 5 días seguidos en racha 🔥",
    racha: 5,
    nivelActividad: 12,
    objetivo: "Fitness",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    posts: [
      {
        id: 101,
        image:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop",
        caption: "Entrenamiento matutino 💪 #nopainnogain",
        likes: 245,
        comments: 18,
        timestamp: "2 horas atrás",
      },
    ],
  },
  {
    id: 2,
    username: "maria-lopez",
    nombre: "María López",
    email: "maria@example.com",
    bio: "🍽️ Food lover | Cocinando historias 👨‍🍳",
    racha: 8,
    nivelActividad: 15,
    objetivo: "Nutrición",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    posts: [],
  },
  {
    id: 3,
    username: "carlos-martinez",
    nombre: "Carlos Martínez",
    email: "carlos@example.com",
    bio: "🚀 Tech enthusiast | React Dev",
    racha: 12,
    nivelActividad: 18,
    objetivo: "Desarrollo",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    posts: [],
  },
];

/**
 * Obtener usuario por username slug
 */
export const getUserByUsername = (username) => {
  const normalizedUsername = username?.toLowerCase()?.trim();

  return (
    mockUsersData.find(
      (user) => user.username === normalizedUsername
    ) || null
  );
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = () => {
  return mockUsersData;
};

/**
 * Obtener posts de un usuario
 */
export const getUserPosts = (username) => {
  const user = getUserByUsername(username);
  return user ? user.posts : [];
};

/**
 * Obtener post específico con autor
 */
export const getPostWithAuthor = (username, postId) => {
  const user = getUserByUsername(username);
  if (!user) return null;

  const post = user.posts.find((p) => p.id === postId);
  if (!post) return null;

  return {
    ...post,
    author: {
      nombre: user.nombre,
      username: user.username,
      avatar: user.avatar,
    },
  };
};