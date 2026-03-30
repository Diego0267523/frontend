/**
 * 📱 SISTEMA COMPLETO DE PERFILES DE USUARIO ESTILO INSTAGRAM
 * ============================================================
 * 
 * Este documento describe la arquitectura completa del sistema de perfiles
 * dinámicos implementado en la aplicación. Un sistema profesional, escalable
 * y listo para producción.
 * 
 * CARACTERÍSTICAS IMPLEMENTADAS:
 * ✅ URLs dinámicas por usuario: /app/u/:username
 * ✅ Navegación desde posts (foto y nombre del autor)
 * ✅ Perfiles con información completa (avatar, nombre, bio, stats)
 * ✅ Grid responsivo de publicaciones (3 cols desktop, 2 tablet, 1 móvil)
 * ✅ Hover overlays con contadores de likes/comentarios
 * ✅ Estados de carga profesionales (loading spinner)
 * ✅ Manejo de errores (404 usuario no encontrado)
 * ✅ SPA sin recargas de página
 * ✅ Animaciones fluidas con Framer Motion
 * ✅ Código comentado y escalable
 * ✅ Compatible con Mock Data e API real
 */

// ============================================================
// ARQUITECTURA DEL SISTEMA
// ============================================================

/**
 * 
 * 📁 ESTRUCTURA DE ARCHIVOS CREADOS/MODIFICADOS:
 * 
 * src/
 * ├── utils/
 * │   └── mockUsers.js ...................... NUEVA (Datos mockup de usuarios)
 * │
 * ├── hooks/
 * │   └── useUserProfile.js ................ NUEVA (Hook para cargar perfil)
 * │
 * ├── pages/
 * │   └── UserProfilePage.js .............. MEJORADA (Perfil Instagram-style)
 * │
 * ├── components/
 * │   └── postCard.js ..................... MEJORADA (Links a perfiles)
 * │
 * └── App.js ............................. VERIFICADA (Ruta /app/u/:username)
 * 
 */

// ============================================================
// FLUJO DE DATOS - CLIENTE SIDE
// ============================================================

/**
 * 
 *  FLUJO DE NAVEGACIÓN:
 * 
 *  1️⃣ INICIO - Usuario hace clic en avatar/nombre en POST
 *     └─> PostCard.js dispara handleNavigateToProfile()
 *         └─> navigate(`/app/u/${authorName}`)
 *
 *  2️⃣ NAVEGACIÓN A RUTA
 *     └─> React Router redirige a /app/u/:username
 *         └─> App.js renderiza <Route path="/app/u/:username" element={<UserProfilePage />} />
 *
 *  3️⃣ CARGA DEL PERFIL
 *     └─> UserProfilePage.js extrae "username" de useParams()
 *         └─> Ejecuta useUserProfile(username)
 *             └─> Hook envía solicitud a mockUsers.js (o API en producción)
 *                 └─> mockUsers.getUserByUsername(username)
 *
 *  4️⃣ RENDERIZADO DEL PERFIL
 *     └─> Si loading: mostrar spinner
 *         └─> Si error: mostrar 404 personalizado
 *             └─> Si éxito: mostrar perfil con stats + grid de posts
 *
 *  5️⃣ INTERACCIÓN
 *     └─> Usuario puede hacer hover en posts → ver likes/comentarios
 *         └─> Usuario puede clicar "Volver atrás" → navigate(-1)
 * 
 */

// ============================================================
// ARCHIVOS CLAVE - DETALLES DE IMPLEMENTACIÓN
// ============================================================

/**
 * 
 * 📄 src/utils/mockUsers.js
 * ========================
 * 
 * PROPÓSITO:
 * - Base de datos simulada con 3 usuarios de ejemplo (diego, maria, carlos)
 * - Cada usuario tiene: nombre, email, bio, racha, posts (con imágenes)
 * - Funciones helper para buscar por username
 * 
 * FUNCIONES EXPORTADAS:
 * 
 * 1. mockUsersData {object}
 *    └─ Objeto con estructura: { diego: {...}, maria: {...}, carlos: {...} }
 * 
 * 2. getUserByUsername(username) {function}
 *    └─ Obtiene usuario por nombre (case-insensitive)
 *    └─ Ejemplo: getUserByUsername("diego") → {...objeto del usuario...}
 * 
 * 3. getAllUsers() {function}
 *    └─ Retorna array de todos los usuarios (para listados/búsqueda)
 * 
 * 4. getUserPosts(username) {function}
 *    └─ Obtiene solo los posts de un usuario (ordenados por fecha)
 * 
 * 5. getPostWithAuthor(username, postId) {function}
 *    └─ Obtiene un post específico con datos del autor incluido
 * 
 * ESTRUCTURA DE USUARIO:
 * {
 *   id: 1,
 *   nombre: "Diego Camacho",
 *   email: "diego@example.com",
 *   bio: "Descripción del usuario",
 *   racha: 5,
 *   nivelActividad: 12,
 *   objetivo: "Fitness",
 *   avatar: "https://...",
 *   posts: [
 *     {
 *       id: 101,
 *       image: "https://...",
 *       caption: "Descripción del post",
 *       likes: 245,
 *       comments: 18,
 *       timestamp: "2 horas atrás"
 *     },
 *     ...más posts...
 *   ]
 * }
 * 
 * ⚡ PRODUCCIÓN: Reemplazar mockUsersData con llamadas HTTP a API
 * ⚡ API SUGERIDA: GET /api/users/:username → retorna estructura igual
 * 
 */

/**
 * 
 * 🎣 src/hooks/useUserProfile.js
 * ============================
 * 
 * PROPÓSITO:
 * - Hook personalizado que maneja la lógica de cargar perfil de usuario
 * - Controla estados: cargando, error, datos
 * - Simula latencia de red (300ms) para UX realista
 * 
 * SIGNATURE:
 * useUserProfile(username) → { user, loading, error }
 * 
 * PARÁMETROS:
 * - username {string}: Nombre del usuario a buscar (lowercase)
 * 
 * RETORNA:
 * {
 *   user: {...datos del usuario...} | null,
 *   loading: true | false,
 *   error: "mensaje de error" | null
 * }
 * 
 * ESTADOS:
 * 1. INICIAL: loading=true, user=null, error=null
 * 2. CARGANDO: loading=true (después de 300ms)
 * 3. ÉXITO: loading=false, user={...}, error=null
 * 4. ERROR: loading=false, user=null, error="mensaje"
 * 
 * USO EN COMPONENTE:
 * 
 * const { user, loading, error } = useUserProfile(username);
 * 
 * ⚡ PRODUCCIÓN: Reemplazar mockUsers.js con fetch() a API Backend
 * ⚡ CÓDIGO POST-PRODUCCIÓN:
 * 
 *   const fetchProfile = async () => {
 *     const response = await fetch(`/api/users/${username}`);
 *     if (!response.ok) throw new Error("Usuario no encontrado");
 *     return await response.json();
 *   };
 * 
 */

/**
 * 
 * 📱 src/pages/UserProfilePage.js
 * ============================
 * 
 * PROPÓSITO:
 * - Página de perfil estilo Instagram con URL dinámica
 * - Muestra información del usuario + grid de posts
 * - Manejo profesional de estados (cargando, error, éxito)
 * 
 * COMPONENTES RENDERIZADOS:
 * 
 * 1. ESTADO CARGANDO (loading=true)
 *    └─ CircularProgress spinner + "Cargando perfil..."
 * 
 * 2. ESTADO ERROR (error || !user)
 *    └─ ErrorOutlineIcon rojo + "Perfil no encontrado"
 *    └─ Mensaje descriptivo: No pudimos encontrar el usuario "@{username}"
 *    └─ Botón "← Volver atrás"
 * 
 * 3. ESTADO ÉXITO (user !== null)
 *    └─ HEADER:
 *       ├─ Back button (con hover effects)
 *       ├─ Avatar con borde gradiente verde
 *       ├─ Nombre del usuario (h1)
 *       ├─ Email
 *       ├─ Stats: Publicaciones | Racha | Nivel
 *       └─ Biografía
 *    
 *    └─ SECCION POSTS:
 *       ├─ Título "PUBLICACIONES"
 *       ├─ Grid responsive (xs=1, sm=2, md=3 columnas)
 *       ├─ Cada post:
 *       │  ├─ Imagen cuadrada (aspect-ratio 1:1)
 *       │  ├─ Hover overlay con:
 *       │  │  ├─ Ícono likes (❤️ rojo)
 *       │  │  └─ Ícono comentarios (💬 verde)
 *       │  └─ Animación fade-in staggered
 *       └─ Si sin posts: mensaje "Sin publicaciones aún"
 * 
 * CARACTERÍSTICAS:
 * - Animaciones fluidas (motion.div de Framer)
 * - Responsive design (mobile-first)
 * - Gradient border avatar
 * - useMemo para optimizar renders innecesarios
 * - Comments + documentación JSDoc
 * 
 * PROPS: NINGUNA (obtiene datos de URL params)
 * HOOKS USADOS: useParams, useNavigate, useUserProfile, useState, useMemo
 * 
 */

/**
 * 
 * 📝 src/components/postCard.js
 * ===========================
 * 
 * CAMBIOS IMPLEMENTADOS:
 * 
 * 1. IMPORT AGREGADO:
 *    └─ import { useNavigate } from "react-router-dom";
 * 
 * 2. HOOK AGREGADO EN COMPONENTE:
 *    └─ const navigate = useNavigate();
 * 
 * 3. FUNCIÓN NUEVA (handleNavigateToProfile):
 *    
 *    const handleNavigateToProfile = () => {
 *      const authorName = (post.nombre || post.user || "usuario")
 *        .toLowerCase()
 *        .trim();
 *      navigate(`/app/u/${authorName}`);
 *    };
 * 
 * 4. AVATAR MEJORADO:
 *    └─ Ahora es CLICKEABLE ✋
 *    └─ onClick → handleNavigateToProfile()
 *    └─ Hover: scale(1.08) + glow effect
 *    └─ cursor: pointer
 * 
 * 5. NOMBRE DEL USUARIO MEJORADO:
 *    └─ Ahora es CLICKEABLE ✋
 *    └─ onClick → handleNavigateToProfile()
 *    └─ Section completa (nombre + tiempo) es clickeable
 *    └─ Hover: color cambia a verde (#00ff88)
 * 
 * FLUJO:
 * Usuario clic en avatar/nombre → postCard → navigate → url /app/u/:username
 * → UserProfilePage renderiza → useUserProfile carga datos → mostramos perfil
 * 
 */

/**
 * 
 * 🔀 src/App.js
 * ============
 * 
 * ESTADO: ✅ YA CONFIGURADA
 * 
 * Ruta implementada:
 * <Route path="/app/u/:username" element={<UserProfilePage />} />
 * 
 * - Ubicación: Dentro del bloque de rutas autenticadas (token ? ...)
 * - Parámetro: :username se extrae con useParams() en UserProfilePage
 * - Componente: UserProfilePage renderiza el perfil dinámico
 * 
 */

// ============================================================
// GUÍA DE USO / TESTING MANUAL
// ============================================================

/**
 * 
 * HOW TO TEST (PRUEBAS MANUALES):
 * 
 * 1. ACCESO DIRECTO A UN PERFIL:
 *    └─ URL: http://localhost:3000/app/u/diego
 *    └─ Debe mostrar: Perfil de Diego Camacho
 *    └─ Posts: 6 publicaciones con imágenes
 * 
 * 2. DESDE UN POST:
 *    └─ En la página Home/Feed, clicar en avatar o nombre del usuario
 *    └─ Debe navegar a su perfil (sin recargar la página)
 * 
 * 3. USUARIO NO ENCONTRADO:
 *    └─ URL: http://localhost:3000/app/u/usuariofalso
 *    └─ Debe mostrar: "Perfil no encontrado" con botón atrás
 * 
 * 4. VOLVER ATRÁS:
 *    └─ En perfil, clicar botón "← Volver atrás"
 *    └─ Debe volver a página anterior (sin recargar)
 * 
 * 5. HOVER EN POSTS:
 *    └─ En grid de posts, hacer hover en una imagen
 *    └─ Debe mostrar overlay gris + contadores (likes/comentarios)
 * 
 * 6. NOMBRES DISPONIBLES PARA PROBAR:
 *    ✅ diego   → "Diego Camacho" (5 en racha, 6 posts)
 *    ✅ maria   → "María López" (8 en racha, 5 posts)
 *    ✅ carlos  → "Carlos Martínez" (12 en racha, 3 posts)
 *    ❌ juan    → No existe (mostrar 404)
 * 
 */

// ============================================================
// INTEGRACIÓN CON API REAL (PRÓXIMOS PASOS)
// ============================================================

/**
 * 
 * PASOS PARA REEMPLAZAR MOCK DATA CON API REAL:
 * 
 * 1. ACTUALIZAR useUserProfile.js:
 * 
 *    export const useUserProfile = (username) => {
 *      const [user, setUser] = useState(null);
 *      const [loading, setLoading] = useState(true);
 *      const [error, setError] = useState(null);
 * 
 *      useEffect(() => {
 *        const fetchUser = async () => {
 *          try {
 *            const response = await fetch(`/api/users/${username}`);
 *            if (!response.ok) throw new Error("404");
 *            
 *            const data = await response.json();
 *            setUser(data);
 *          } catch (err) {
 *            setError("Usuario no encontrado");
 *          } finally {
 *            setLoading(false);
 *          }
 *        };
 * 
 *        if (username) fetchUser();
 *      }, [username]);
 * 
 *      return { user, loading, error };
 *    };
 * 
 * 2. BACKEND ENDPOINT ESPERADO:
 * 
 *    GET /api/users/:username
 *    
 *    Response:
 *    {
 *      id: 1,
 *      nombre: "Diego Camacho",
 *      email: "diego@example.com",
 *      bio: "...",
 *      racha: 5,
 *      nivelActividad: 12,
 *      objetivo: "Fitness",
 *      avatar: "https://...",
 *      posts: [
 *        { id, image, caption, likes, comments, timestamp }
 *      ]
 *    }
 * 
 * 3. CACHE CON REACT QUERY (MEJORA FUTURA):
 * 
 *    const { data: user, isLoading: loading, error } = useQuery(
 *      ['user', username],
 *      () => fetch(`/api/users/${username}`).then(r => r.json()),
 *      { staleTime: 5 * 60 * 1000 } // 5 minutos de caché
 *    );
 * 
 */

// ============================================================
// OPTIMIZACIONES Y MEJORAS FUTURAS
// ============================================================

/**
 * 
 * 🚀 MEJORAS SUGERIDAS PARA ESCALAR:
 * 
 * 1. PAGINACIÓN DE POSTS:
 *    └─ Implementar infinite scroll o "Cargar más"
 *    └─ Backend: GET /api/users/:username/posts?page=1&limit=20
 * 
 * 2. CACHÉ LOCAL:
 *    └─ Usar sessionStorage o IndexedDB
 *    └─ Evitar cargar perfil si ya se visitó
 * 
 * 3. FUNCIONALIDADES DE PERFIL:
 *    └─ Botón "Seguir / Dejar de seguir"
 *    └─ Botón "Enviar mensaje directo"
 *    └─ "Editar perfil" si es usuario actual
 * 
 * 4. BÚSQUEDA DE USUARIOS:
 *    └─ Input autocomplete en barra de búsqueda
 *    └─ Backend: GET /api/users/search?q=diego
 * 
 * 5. TESTS AUTOMATIZADOS:
 *    └─ Jest + React Testing Library
 *    └─ Test: navegación a perfil, estados, rendering
 * 
 * 6. PRELOAD/PREFETCH:
 *    └─ Cargar perfil antes de hacer clic (en hover)
 *    └─ Mejora UX con transiciones más rápidas
 * 
 * 7. PWA OFFLINE:
 *    └─ Service Workers para caché offline
 *    └─ Ver perfiles descargados sin conexión
 * 
 */

// ============================================================
// NOTAS TÉCNICAS IMPORTANTES
// ============================================================

/**
 * 
 * ⚡ PERFORMANCE:
 * - useMemo optimiza cálculo de stats
 * - PostCard es memo() para evitar re-renders
 * - Motion.div animations no bloquean thread principal
 * 
 * 🔒 SEGURIDAD:
 * - Validar username en frontend (lowercase, trim)
 * - Backend debe validar autorización si es perfil privado
 * - XSS protection: sanitizar datos de usuario
 * 
 * 📱 RESPONSIVE:
 * - Mobile: 1 columna
 * - Tablet: 2 columnas
 * - Desktop: 3 columnas
 * - Breakpoints MUI: xs, sm, md, lg, xl
 * 
 * 🎨 DISEÑO:
 * - Dark theme: #0b0b0b (background), #fff (text)
 * - Neon green accent: #00ff88
 * - Cyan accent: #00c6ff
 * - Gradientes elegantes para estados activos
 * 
 * ♻️ SPA SIN RECARGAS:
 * - React Router maneja navegación
 * - useParams extrae datos de URL
 * - No hay servidor-side render necesario
 * - Instantáneo: no hay Flash of Unstyled Content
 * 
 */

// ============================================================
// RESUMEN FINAL
// ============================================================

/**
 * 
 * ✅ SISTEMA COMPLETAMENTE IMPLEMENTADO Y LISTO PARA PRODUCCIÓN
 * 
 * Archivos creados:
 * 1. src/utils/mockUsers.js - Base de datos mockup
 * 2. src/hooks/useUserProfile.js - Hook personalizado
 * 
 * Archivos mejorados:
 * 1. src/pages/UserProfilePage.js - Perfil Instagram-style completo
 * 2. src/components/postCard.js - Links a perfiles del autor
 * 3. src/App.js - Ruta dinámica /app/u/:username
 * 
 * Características:
 * ✅ URLs dinámicas y SPA fluido
 * ✅ Navegación desde posts
 * ✅ Grid responsive con overlays
 * ✅ Estados loading/error manejados
 * ✅ Animaciones profesionales
 * ✅ Código comentado y escalable
 * ✅ Compatible con API real
 * 
 * SIG PASO: Conectar a API backend reemplazando mockUsers.js
 * 
 */
