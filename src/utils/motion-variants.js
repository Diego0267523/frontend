/**
 * 🎬 Motion Variants - Animaciones reutilizables profesionales
 * Diseñadas para mantener consistencia y rendimiento en toda la app
 */

// ============================================================================
// ANIMACIONES DE CONTENEDOR (parent)
// ============================================================================

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.3
    }
  }
};

// ============================================================================
// ANIMACIONES DE ITEMS (children)
// ============================================================================

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

// ============================================================================
// ANIMACIONES DE FADE (entrada/salida suave)
// ============================================================================

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// ============================================================================
// ANIMACIONES DE SLIDE (deslizamiento)
// ============================================================================

export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.3 }
  }
};

export const slideInRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.3 }
  }
};

export const slideInUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: 40,
    transition: { duration: 0.3 }
  }
};

export const slideInDownVariants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: { duration: 0.3 }
  }
};

// ============================================================================
// ANIMACIONES DE SCALE (escala)
// ============================================================================

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 }
  }
};

export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================================================
// ANIMACIONES DE HOVER
// ============================================================================

export const hoverScaleVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const hoverYVariants = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// ============================================================================
// ANIMACIONES MODALES (modal backdrop + contenido)
// ============================================================================

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// ============================================================================
// ANIMACIONES DE BOTONES
// ============================================================================

export const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// ============================================================================
// ANIMACIONES DE TARJETAS (Cards)
// ============================================================================

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.3 }
  }
};

// ============================================================================
// ANIMACIONES DE ROTACIÓN (Loading spinners, etc)
// ============================================================================

export const rotateVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const spinVariants = {
  spinning: {
    rotate: [0, 360],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// ============================================================================
// ANIMACIONES DE CHAT (para mensajes)
// ============================================================================

export const chatBubbleVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

export const typingIndicatorVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================================================
// ANIMACIONES DE FLOATING ELEMENTS
// ============================================================================

export const floatingVariants = {
  initial: { y: 0, opacity: 0 },
  animate: {
    y: [0, -10, 0],
    opacity: 1,
    transition: {
      y: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.3
      }
    }
  }
};

export const floatingBubbleVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.3
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: 60,
    scale: 0.3,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.15,
    boxShadow: "0 14px 28px rgba(0, 255, 136, 0.35)",
    transition: { duration: 0.3 }
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 }
  }
};

// ============================================================================
// ANIMACIONES DE TRANSICIÓN DE PÁGINA
// ============================================================================

export const pageTransitionVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

// ============================================================================
// ANIMACIONES DE SKELETON LOADERS
// ============================================================================

export const skeletonPulseVariants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================================================
// ANIMACIONES DE NOTIFICACIONES
// ============================================================================

export const notificationVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    y: 0
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    y: 0,
    transition: { duration: 0.3 }
  }
};

// ============================================================================
// ANIMACIONES DE BARRA DE PROGRESO
// ============================================================================

export const progressBarVariants = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  visible: {
    scaleX: 1,
    transformOrigin: "left",
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// ============================================================================
// ANIMACIONES DE TEXTO (staggered)
// ============================================================================

export const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const textCharacterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// ============================================================================
// EASINGS PERSONALIZADOS (Cubic Bézier curves)
// ============================================================================

export const EASINGS = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.175, 0.885, 0.32, 1.275],
  delay: [0.33, 0, 0.67, 1],
  snappy: [0.6, 0.04, 0.98, 0.34]
};

// ============================================================================
// DURACIONES POR DEFECTO
// ============================================================================

export const DURATIONS = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 0.8
};

// ============================================================================
// TRANSICIONES COMUNES
// ============================================================================

export const TRANSITIONS = {
  fast: { duration: 0.2, ease: "easeOut" },
  normal: { duration: 0.4, ease: "easeOut" },
  slow: { duration: 0.6, ease: "easeOut" },
  smooth: { duration: 0.4, ease: EASINGS.smooth }
};
