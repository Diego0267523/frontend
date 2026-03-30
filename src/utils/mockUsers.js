/**
 * 📊 DATOS MOCKUP DE USUARIOS
 * Sistema de perfiles simulado para desarrollo y pruebas
 * En producción, estos datos vendrán de la API
 */

export const mockUsersData = {
  diego: {
    id: 1,
    nombre: "Diego Camacho",
    email: "diego@example.com",
    bio: "🏋️ Fitness enthusiast | Gym lover | 5 días seguidos en racha 🔥",
    racha: 5,
    nivelActividad: 12,
    objetivo: "Fitness",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
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
      {
        id: 102,
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop",
        caption: "Día de piernas completado ✅",
        likes: 189,
        comments: 14,
        timestamp: "1 día atrás",
      },
      {
        id: 103,
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
        caption: "Desayuno post-entreno",
        likes: 156,
        comments: 22,
        timestamp: "3 días atrás",
      },
      {
        id: 104,
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
        caption: "Nueva PR en sentadillas 🎉",
        likes: 312,
        comments: 35,
        timestamp: "5 días atrás",
      },
      {
        id: 105,
        image:
          "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=500&h=500&fit=crop",
        caption: "Sesión de cardio finalizada",
        likes: 178,
        comments: 19,
        timestamp: "1 semana atrás",
      },
      {
        id: 106,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        caption: "Motivación para el viernes 🔥",
        likes: 234,
        comments: 45,
        timestamp: "1 semana atrás",
      },
    ],
  },
  maria: {
    id: 2,
    nombre: "María López",
    email: "maria@example.com",
    bio: "🍽️ Food lover | Cocinando historias 👨‍🍳 | Recetas que aman",
    racha: 8,
    nivelActividad: 15,
    objetivo: "Nutrición",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    posts: [
      {
        id: 201,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        caption: "Pasta fresca hecha en casa 🍝",
        likes: 432,
        comments: 56,
        timestamp: "3 horas atrás",
      },
      {
        id: 202,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        caption: "Bowl de acaí perfecto para desayuno",
        likes: 389,
        comments: 42,
        timestamp: "1 día atrás",
      },
      {
        id: 203,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        caption: "Receta de salmón a la mantequilla 🐟",
        likes: 567,
        comments: 73,
        timestamp: "2 días atrás",
      },
      {
        id: 204,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        caption: "Postre sin azúcar que te encantará 🍫",
        likes: 298,
        comments: 31,
        timestamp: "4 días atrás",
      },
      {
        id: 205,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        caption: "Pizza al horno con ingredientes premium",
        likes: 445,
        comments: 64,
        timestamp: "6 días atrás",
      },
    ],
  },
  carlos: {
    id: 3,
    nombre: "Carlos Martínez",
    email: "carlos@example.com",
    bio: "🚀 Tech enthusiast | React Dev | Full-stack lover",
    racha: 12,
    nivelActividad: 18,
    objetivo: "Desarrollo",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    posts: [
      {
        id: 301,
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
        caption: "Nuevo proyecto con React 19 🎉",
        likes: 567,
        comments: 89,
        timestamp: "4 horas atrás",
      },
      {
        id: 302,
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
        caption: "Aprendiendo WebSockets",
        likes: 234,
        comments: 28,
        timestamp: "2 días atrás",
      },
      {
        id: 303,
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
        caption: "Deploy exitoso al servidor 🚀",
        likes: 345,
        comments: 42,
        timestamp: "5 días atrás",
      },
    ],
  },
};

/**
 * Obtener usuario por nombre de usuario
 * @param {string} username - Nombre del usuario (lowercase)
 * @returns {object|null} - Datos del usuario o null si no existe
 */
export const getUserByUsername = (username) => {
  const normalizedUsername = username?.toLowerCase().trim();
  return mockUsersData[normalizedUsername] || null;
};

/**
 * Obtener todos los usuarios
 * @returns {array} - Array de usuarios
 */
export const getAllUsers = () => {
  return Object.values(mockUsersData);
};

/**
 * Obtener posts de un usuario
 * @param {string} username - Nombre del usuario
 * @returns {array|null} - Array de posts o null si el usuario no existe
 */
export const getUserPosts = (username) => {
  const user = getUserByUsername(username);
  return user ? user.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : null;
};

/**
 * Obtener post específico de un usuario
 * @param {string} username - Nombre del usuario
 * @param {number} postId - ID del post
 * @returns {object|null} - Datos del post con info del autor
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
      username: username,
      avatar: user.avatar,
    },
  };
};
