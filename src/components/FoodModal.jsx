// src/components/FoodModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { analyzeFood, createFoodEntry, createFoodEntryWithImage } from "../api/food";

const FoodModal = ({
  open,
  onClose,
  onSuccess,
  snackbar,
  setSnackbar,
  targetCalories,
  todayTotal,
  todayProtein,
  todayCarbs,
}) => {
  const [foodText, setFoodText] = useState("");
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [foodAnalysis, setFoodAnalysis] = useState(null);
  const [foodAnalyzing, setFoodAnalyzing] = useState(false);
  const [loadingFood, setLoadingFood] = useState(false);
  const [editableCalories, setEditableCalories] = useState("");
  const [editableProtein, setEditableProtein] = useState("");
  const [editableCarbs, setEditableCarbs] = useState("");

  const resetForm = () => {
    setFoodText("");
    setFoodImageFile(null);
    setFoodAnalysis(null);
    setEditableCalories("");
    setEditableProtein("");
    setEditableCarbs("");
    setLoadingFood(false);
  };

  const handleAnalyzeFood = async () => {
    if (!foodText.trim() && !foodImageFile) {
      setSnackbar({ open: true, message: "Ingresa descripción o sube una imagen.", severity: "error" });
      return;
    }

    setFoodAnalyzing(true);
    setFoodAnalysis(null);

    try {
      let response = null;

      if (foodImageFile) {
        response = await analyzeFood({ text: foodText.trim(), imageFile: foodImageFile });
      } else {
        const maybeUrl = foodText.trim().startsWith("http") ? foodText.trim() : undefined;
        response = await analyzeFood({ text: foodText.trim(), imageUrl: maybeUrl });
      }

      if (response) {
        const result = response.data || response;
        
        // 🔥 NUEVA LÓGICA: Procesar múltiples alimentos detectados
        if (result.detected_foods && result.detected_foods.length > 0) {
          // Múltiples alimentos detectados - usar totales combinados
          const totalNutrition = result.total_nutrition || {};
          
          setFoodAnalysis({
            ...result,
            detected_foods: result.detected_foods,
            summary: result.summary
          });
          
          setEditableCalories(totalNutrition.calories || 0);
          setEditableProtein(totalNutrition.proteina || 0);
          setEditableCarbs(totalNutrition.carbohidratos || 0);
          
          setSnackbar({ 
            open: true, 
            message: `Análisis completado: ${result.detected_foods.length} alimentos detectados`, 
            severity: "success" 
          });
        } else {
          // 🔥 LÓGICA ANTERIOR: Respuesta antigua (texto o análisis simple)
          const aiJson = result.details?.aiJson || result.details?.imageAiJson;

          const safeNumber = (value) => {
            const num = Number(value);
            return isNaN(num) || num < 0 ? 0 : num;
          };

          const calories = aiJson?.total?.calorias ?? result.calories ?? result.nutrition?.calories ?? 0;
          const protein = aiJson?.total?.proteina ?? result.proteina ?? result.nutrition?.proteina ?? 0;
          const carbs = aiJson?.total?.carbohidratos ?? result.carbohidratos ?? result.nutrition?.carbohidratos ?? 0;

          setFoodAnalysis({ ...result, aiJson });
          setEditableCalories(safeNumber(calories));
          setEditableProtein(safeNumber(protein));
          setEditableCarbs(safeNumber(carbs));

          setSnackbar({ open: true, message: "Análisis completado", severity: "success" });
        }
      }
    } catch (error) {
      console.error("Error analizando comida:", error);
      const message = error.response?.data?.message || error.message || "No se pudo analizar la comida";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setFoodAnalyzing(false);
    }
  };

  const handleSaveFoodEntry = async () => {
    const calories = Number(editableCalories || 0);
    const proteina = Number(editableProtein || 0);
    const carbohidratos = Number(editableCarbs || 0);

    if (!foodText.trim() && !foodImageFile) {
      setSnackbar({ open: true, message: "Ingresa una descripción o sube una imagen", severity: "error" });
      return;
    }

    if (!foodAnalysis && calories === 0 && proteina === 0 && carbohidratos === 0) {
      setSnackbar({ open: true, message: "Ingresa valores nutricionales o analiza primero", severity: "error" });
      return;
    }

    if (calories < 0 || proteina < 0 || carbohidratos < 0) {
      setSnackbar({ open: true, message: "Los valores no pueden ser negativos", severity: "error" });
      return;
    }

    setLoadingFood(true);

    try {
      const data = {
        calorias: calories,
        proteina,
        carbohidratos
      };

      const cleanedDescription = foodText.trim();
      if (cleanedDescription.length > 0) {
        data.descripcion = cleanedDescription;
      }

      if (foodAnalysis?.aiJson?.items) {
        data.aiJson = {
          ...foodAnalysis.aiJson,
          items: foodAnalysis.aiJson.items
        };
      }

      let response;
      if (foodImageFile) {
        const formData = new FormData();
        formData.append("descripcion", foodText.trim());
        formData.append("calorias", calories.toString());
        formData.append("proteina", proteina.toString());
        formData.append("carbohidratos", carbohidratos.toString());
        if (data.aiJson) {
          formData.append("aiJson", JSON.stringify(data.aiJson));
        }
        formData.append("image", foodImageFile);
        response = await createFoodEntryWithImage(formData);
      } else {
        response = await createFoodEntry(data);
      }

      if (response.data.success) {
        resetForm();
        onClose();
        setSnackbar({ open: true, message: "Comida registrada exitosamente", severity: "success" });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error guardando comida:", error);
      const message = error.response?.data?.message || "Error al guardar";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoadingFood(false);
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            bgcolor: "#111",
            borderRadius: 2,
            p: 3,
            minWidth: 400,
            maxWidth: 600,
            color: "#fff",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#00ff88" }}>
            Registrar comida 🍽️
          </Typography>

          <Typography sx={{ color: "#aaa", mb: 1 }}>Descripción de la comida</Typography>
          <textarea
            value={foodText}
            onChange={(e) => setFoodText(e.target.value)}
            style={{
              width: "100%",
              minHeight: 80,
              borderRadius: 8,
              padding: 8,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
            placeholder="Ej: Ensalada de pollo con quinoa..."
          />

          <Typography sx={{ color: "#aaa", mt: 2, mb: 1 }}>O sube imagen (opcional)</Typography>
          <Button variant="contained" component="label" sx={{ bgcolor: "#333", color: "#fff" }}>
            Subir imagen
            <input
              type="file"
              hidden
              onChange={(e) => setFoodImageFile(e.target.files[0])}
            />
          </Button>
          {foodImageFile && (
            <Typography sx={{ color: "#00ff88", mt: 1 }}>{foodImageFile.name}</Typography>
          )}

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              onClick={handleAnalyzeFood}
              sx={{ bgcolor: "#00ff88", color: "#000" }}
              disabled={foodAnalyzing}
            >
              {foodAnalyzing ? <CircularProgress size={20} /> : "Analizar"}
            </Button>
            <Button
              onClick={handleSaveFoodEntry}
              sx={{ bgcolor: "#00ff88", color: "#000" }}
              disabled={loadingFood}
            >
              {loadingFood ? <CircularProgress size={20} /> : "Guardar"}
            </Button>
            <Button onClick={() => { resetForm(); onClose(); }} sx={{ bgcolor: "#333", color: "#fff" }}>
              Cancelar
            </Button>
          </Box>

          {foodAnalysis && (
            <Box sx={{ mt: 2, border: "1px solid #333", borderRadius: 2, p: 1 }}>
              <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                Resultado IA (editable)
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <input
                  type="number"
                  placeholder="Calorías"
                  value={editableCalories}
                  onChange={(e) => setEditableCalories(e.target.value)}
                  style={{ flex: 1, padding: 4, borderRadius: 4 }}
                />
                <input
                  type="number"
                  placeholder="Proteína (g)"
                  value={editableProtein}
                  onChange={(e) => setEditableProtein(e.target.value)}
                  style={{ flex: 1, padding: 4, borderRadius: 4 }}
                />
                <input
                  type="number"
                  placeholder="Carbohidratos (g)"
                  value={editableCarbs}
                  onChange={(e) => setEditableCarbs(e.target.value)}
                  style={{ flex: 1, padding: 4, borderRadius: 4 }}
                />
              </Box>

              {/* 🔥 NUEVO: Mostrar alimentos detectados individualmente */}
              {foodAnalysis?.detected_foods && foodAnalysis.detected_foods.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                  <Typography sx={{ color: "#00ff88", fontWeight: "bold", mb: 1 }}>
                    🍽️ Alimentos Detectados:
                  </Typography>
                  {foodAnalysis.detected_foods.map((food, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: "#333", borderRadius: 1 }}>
                      <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                        {index + 1}. {food.name}
                      </Typography>
                      <Typography sx={{ color: "#ccc", fontSize: "0.9em" }}>
                        Confianza: {(food.confidence * 100).toFixed(1)}% | 
                        Porción: {food.serving_size}g
                      </Typography>
                      <Typography sx={{ color: "#00ff88", fontSize: "0.9em" }}>
                        🔥 {food.nutrition.calories} cal | 
                        🥩 {food.nutrition.proteina}g proteína | 
                        🌾 {food.nutrition.carbohidratos}g carbohidratos | 
                        🥑 {food.nutrition.grasas}g grasas
                      </Typography>
                    </Box>
                  ))}
                  {foodAnalysis.summary && (
                    <Typography sx={{ color: "#aaa", fontSize: "0.9em", mt: 1, fontStyle: "italic" }}>
                      📝 {foodAnalysis.summary}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default FoodModal;