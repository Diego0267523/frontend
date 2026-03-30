/**
 * 🌐 BASE DE DATOS DE PERFILES PÚBLICOS
 * 
 * Sistema de almacenamiento para perfiles públicos de usuarios.
 * Los perfiles se crean automáticamente cuando un usuario se registra.
 * 
 * NOTA: En producción, esto sería reemplazado por llamadas a API backend
 */

// 🗄️ SIMULACIÓN DE BASE DE DATOS EN MEMORIA
// En producción: Usar MongoDB, PostgreSQL, Firebase, etc.
export let publicProfilesDB = {};

/**
 * Normaliza username para URL.
 * - minúsculas
 * - elimina acentos
 * - convierte espacios a guion
 * - elimina caracteres inválidos
 */
export function normalizeUsername(value) {
  if (!value || typeof value !== "string") return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[._-]{2,}/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "");

  return normalized || null;
}

// ============================================================
// PROFILES SAMPLE DATA (Para testing)
// ============================================================

const SAMPLE_PROFILES = {
  diego_sample: {
    username: "diego_sample",
    nombre: "Diego Camacho",
    email: "diego@example.com",
    bio: "🏋️ Fitness enthusiast | Gym lover | 5 días seguidos en racha 🔥",
    categoria: "Fitness",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    portada: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
    followers: 234,
    following: 89,
    createdAt: new Date("2025-01-15"),
    posts: [
      {
        id: "post_1",
        content: "Entrenamiento matutino 💪 #nopainnogain",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop",
        likes: 245,
        comments: 18,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        createdBy: "diego_sample"
      },
      {
        id: "post_2",
        content: "Día de piernas completado ✅",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop",
        likes: 189,
        comments: 14,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
        createdBy: "diego_sample"
      }
    ]
  },
  maria_sample: {
    username: "maria_sample",
    nombre: "María López",
    email: "maria@example.com",
    bio: "🍽️ Food lover | Cocinando historias 👨‍🍳 | Recetas que aman",
    categoria: "Nutrición",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    portada: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=300&fit=crop",
    followers: 567,
    following: 234,
    createdAt: new Date("2025-01-10"),
    posts: [
      {
        id: "post_3",
        content: "Pasta fresca hecha en casa 🍝",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        likes: 432,
        comments: 56,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdBy: "maria_sample"
      }
    ]
  },
  carlos_sample: {
    username: "carlos_sample",
    nombre: "Carlos Martínez",
    email: "carlos@example.com",
    bio: "🚀 Tech enthusiast | React Dev | Full-stack lover",
    categoria: "Tecnología",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    portada: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop",
    followers: 123,
    following: 45,
    createdAt: new Date("2025-01-20"),
    posts: [
      {
        id: "post_4",
        content: "Nuevo proyecto con React 19 🎉",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
        likes: 567,
        comments: 89,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdBy: "carlos_sample"
      }
    ]
  }
};

// Inicializar con datos de ejemplo
Object.assign(publicProfilesDB, SAMPLE_PROFILES);

// ============================================================
// FUNCIONES PÚBLICAS DEL SISTEMA
// ============================================================

/**
 * Crear un nuevo perfil público automáticamente
 * Se llama cuando un usuario se registra
 * 
 * @param {object} userData - Datos del usuario registrado
 * @returns {object} - Perfil creado
 */
export function createPublicProfile(userData) {
  const {
    nombre,
    email,
    username,
    avatar = null,
    bio = "Bienvenido a mi perfil",
    categoria = "General"
  } = userData;

  // Normalizar username y evitar vacío
  const baseUsername = username || (email ? email.split("@")[0] : "");
  const normalizedUsername = normalizeUsername(baseUsername);

  if (!normalizedUsername) {
    throw new Error("Username inválido o no especificado");
  }

  // Evitar duplicados
  if (publicProfilesDB[normalizedUsername]) {
    console.warn(`⚠️ Perfil ${normalizedUsername} ya existe`);
    return publicProfilesDB[normalizedUsername];
  }

  // Crear perfil público
  const publicProfile = {
    // Identidad
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: normalizedUsername,
    nombre: nombre || baseUsername,
    email: email,
    bio: bio || "Bienvenido a mi perfil",
    categoria: categoria || "General",
    
    // Medios
    avatar: avatar || generateDefaultAvatar(username),
    portada: generateDefaultPortada(categoria),
    
    // Estadísticas
    followers: 0,
    following: 0,
    
    // Datos de creación
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Contenido
    posts: [],
    
    // Privacidad
    isPublic: true,
    isVerified: false
  };

  // Guardar en la "base de datos" usando el nombre normalizado
  publicProfilesDB[normalizedUsername] = publicProfile;
  
  console.log(`✅ Perfil público creado: ${normalizedUsername}`);
  return publicProfile;
}

/**
 * Obtener perfil público por username
 * @param {string} username
 * @returns {object|null}
 */
export function getPublicProfile(username) {
  if (!username) return null;
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return null;
  return publicProfilesDB[normalizedUsername] || null;
}

/**
 * Actualizar información del perfil
 * @param {string} username
 * @param {object} updates - Campos a actualizar
 * @returns {object|null}
 */
export function updatePublicProfile(username, updates) {
  const profile = getPublicProfile(username);
  if (!profile) return null;

  const allowedFields = ["bio", "avatar", "portada", "categoria"];
  const updated = { 
    ...profile,
    ...Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    ),
    updatedAt: new Date()
  };

  publicProfilesDB[username] = updated;
  return updated;
}

/**
 * Agregar post al perfil
 * @param {string} username
 * @param {object} postData
 * @returns {object}
 */
export function addPostToProfile(username, postData) {
  const profile = getPublicProfile(username);
  if (!profile) throw new Error("Perfil no encontrado");

  const post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...postData,
    authorId: profile.id || null,
    authorUsername: profile.username,
    authorName: profile.nombre,
    createdBy: profile.username,
    timestamp: new Date(),
    likes: 0,
    comments: [],
    liked: false
  };

  profile.posts.unshift(post); // Agregar al inicio
  profile.updatedAt = new Date();
  
  return post;
}

/**
 * Obtener todos los posts públicos ordenados por fecha
 * Simulación de feed
 * @returns {array}
 */
export function getAllPublicPosts() {
  return Object.values(publicProfilesDB)
    .flatMap(profile => 
      profile.posts.map(post => ({
        ...post,
        author: {
          username: profile.username,
          nombre: profile.nombre,
          avatar: profile.avatar
        }
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Listar todos los perfiles públicos
 * @returns {array}
 */
export function getAllPublicProfiles() {
  return Object.values(publicProfilesDB).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Buscar perfiles por término
 * @param {string} searchTerm
 * @returns {array}
 */
export function searchProfiles(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.values(publicProfilesDB).filter(profile =>
    profile.username.includes(term) ||
    profile.nombre.toLowerCase().includes(term) ||
    profile.bio.toLowerCase().includes(term)
  );
}

/**
 * Like a un post
 * @param {string} postId
 * @param {string} username
 */
export function likePost(postId, username) {
  for (const profile of Object.values(publicProfilesDB)) {
    const post = profile.posts.find(p => p.id === postId);
    if (post) {
      if (!post.likedBy) post.likedBy = [];
      
      const alreadyLiked = post.likedBy.includes(username);
      if (!alreadyLiked) {
        post.likedBy.push(username);
        post.likes = (post.likes || 0) + 1;
      }
      return post;
    }
  }
  return null;
}

/**
 * Unlike a un post
 * @param {string} postId
 * @param {string} username
 */
export function unlikePost(postId, username) {
  for (const profile of Object.values(publicProfilesDB)) {
    const post = profile.posts.find(p => p.id === postId);
    if (post) {
      if (post.likedBy && post.likedBy.includes(username)) {
        post.likedBy = post.likedBy.filter(u => u !== username);
        post.likes = Math.max(0, (post.likes || 1) - 1);
      }
      return post;
    }
  }
  return null;
}

// ============================================================
// FUNCIONES HELPER
// ============================================================

/**
 * Generar avatar por defecto
 */
function generateDefaultAvatar(username) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
}

/**
 * Generar portada por defecto según categoría
 */
function generateDefaultPortada(categoria) {
  const portadas = {
    "Fitness": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
    "Nutrición": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=300&fit=crop",
    "Tecnología": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop",
    "Viajes": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=300&fit=crop",
    "Arte": "https://images.unsplash.com/photo-1549887534-f2cb4460cda5?w=800&h=300&fit=crop",
    "General": "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=300&fit=crop"
  };
  
  return portadas[categoria] || portadas["General"];
}

/**
 * Verificar si un username está disponible
 * @param {string} username
 * @returns {boolean}
 */
export function isUsernameAvailable(username) {
  return !publicProfilesDB[username.toLowerCase().trim()];
}

/**
 * Limpiar base de datos (solo para testing)
 */
export function clearDatabase() {
  Object.keys(publicProfilesDB).forEach(key => delete publicProfilesDB[key]);
  Object.assign(publicProfilesDB, SAMPLE_PROFILES);
  console.log("🔄 Base de datos reseteada");
}

export default {
  publicProfilesDB,
  createPublicProfile,
  getPublicProfile,
  updatePublicProfile,
  addPostToProfile,
  getAllPublicPosts,
  getAllPublicProfiles,
  searchProfiles,
  likePost,
  unlikePost,
  isUsernameAvailable,
  clearDatabase
};
