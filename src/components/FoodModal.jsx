// src/components/FoodModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
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
  const [editableFats, setEditableFats] = useState("");
  const [editableFiber, setEditableFiber] = useState("");
  const [editableSodium, setEditableSodium] = useState("");
  const [manualFoods, setManualFoods] = useState([]);
  const [addFoodText, setAddFoodText] = useState("");

  const resetForm = () => {
    setFoodText("");
    setFoodImageFile(null);
    setFoodAnalysis(null);
    setEditableCalories("");
    setEditableProtein("");
    setEditableCarbs("");
    setEditableFats("");
    setEditableFiber("");
    setEditableSodium("");
    setManualFoods([]);
    setAddFoodText("");
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
          setEditableFats(totalNutrition.grasas || 0);
          setEditableFiber(totalNutrition.fibra || 0);
          setEditableSodium(totalNutrition.sodio || 0);
          
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

  const handleAddFoodByText = async () => {
    if (!addFoodText.trim()) {
      setSnackbar({ open: true, message: "Ingresa el nombre del alimento", severity: "error" });
      return;
    }

    setFoodAnalyzing(true);
    try {
      const response = await analyzeFood({ text: addFoodText.trim() });
      if (response) {
        const result = response.data || response;
        
        // Crear un alimento manual con datos estimados
        const newFood = {
          name: addFoodText.trim(),
          confidence: 0.8,
          serving_size: 100,
          nutrition: {
            calories: result.nutrition?.calories || result.calories || 100,
            proteina: result.nutrition?.proteina || result.proteina || 10,
            carbohidratos: result.nutrition?.carbohidratos || result.carbohidratos || 15,
            grasas: result.nutrition?.grasas || result.grasas || 5,
            fibra: result.nutrition?.fibra || result.fibra || 2,
            sodio: result.nutrition?.sodio || result.sodio || 50
          },
          position: manualFoods.length + 1,
          isManual: true
        };

        setManualFoods(prev => [...prev, newFood]);
        setAddFoodText("");
        
        // Recalcular totales
        updateTotalNutrition([...(foodAnalysis?.detected_foods || []), ...manualFoods, newFood]);
        
        setSnackbar({ open: true, message: "Alimento agregado", severity: "success" });
      }
    } catch (error) {
      console.error("Error agregando alimento:", error);
      setSnackbar({ open: true, message: "Error al agregar alimento", severity: "error" });
    } finally {
      setFoodAnalyzing(false);
    }
  };

  const handleRemoveFood = (index, isManual = false) => {
    if (isManual) {
      const newManualFoods = manualFoods.filter((_, i) => i !== index);
      setManualFoods(newManualFoods);
      updateTotalNutrition([...(foodAnalysis?.detected_foods || []), ...newManualFoods]);
    } else {
      // Para alimentos detectados, crear una copia sin ese alimento
      const detectedFoods = foodAnalysis?.detected_foods || [];
      const newDetectedFoods = detectedFoods.filter((_, i) => i !== index);
      setFoodAnalysis(prev => ({
        ...prev,
        detected_foods: newDetectedFoods
      }));
      updateTotalNutrition([...newDetectedFoods, ...manualFoods]);
    }
  };

  const updateTotalNutrition = (allFoods) => {
    const totalNutrition = allFoods.reduce((total, food) => {
      return {
        calories: total.calories + (food.nutrition.calories || 0),
        proteina: total.proteina + (food.nutrition.proteina || 0),
        carbohidratos: total.carbohidratos + (food.nutrition.carbohidratos || 0),
        grasas: total.grasas + (food.nutrition.grasas || 0),
        fibra: total.fibra + (food.nutrition.fibra || 0),
        sodio: total.sodio + (food.nutrition.sodio || 0)
      };
    }, { calories: 0, proteina: 0, carbohidratos: 0, grasas: 0, fibra: 0, sodio: 0 });

    setEditableCalories(totalNutrition.calories);
    setEditableProtein(totalNutrition.proteina);
    setEditableCarbs(totalNutrition.carbohidratos);
    setEditableFats(totalNutrition.grasas);
    setEditableFiber(totalNutrition.fibra);
    setEditableSodium(totalNutrition.sodio);
  };

  const handleSaveFoodEntry = async () => {
    const calories = Number(editableCalories || 0);
    const proteina = Number(editableProtein || 0);
    const carbohidratos = Number(editableCarbs || 0);
    const grasas = Number(editableFats || 0);
    const fibra = Number(editableFiber || 0);
    const sodio = Number(editableSodium || 0);

    if (!foodText.trim() && !foodImageFile) {
      setSnackbar({ open: true, message: "Ingresa una descripción o sube una imagen", severity: "error" });
      return;
    }

    if (!foodAnalysis && manualFoods.length === 0 && calories === 0 && proteina === 0 && carbohidratos === 0) {
      setSnackbar({ open: true, message: "Ingresa valores nutricionales o analiza primero", severity: "error" });
      return;
    }

    if (calories < 0 || proteina < 0 || carbohidratos < 0 || grasas < 0 || fibra < 0 || sodio < 0) {
      setSnackbar({ open: true, message: "Los valores no pueden ser negativos", severity: "error" });
      return;
    }

    setLoadingFood(true);

    try {
      const data = {
        calorias: calories,
        proteina,
        carbohidratos,
        grasas,
        fibra,
        sodio
      };

      const cleanedDescription = foodText.trim();
      if (cleanedDescription.length > 0) {
        data.descripcion = cleanedDescription;
      }

      // Incluir información de alimentos detectados y manuales
      const allFoods = [
        ...(foodAnalysis?.detected_foods || []),
        ...manualFoods
      ];
      
      if (allFoods.length > 0) {
        data.aiJson = {
          detected_foods: allFoods,
          total_nutrition: {
            calories,
            proteina,
            carbohidratos,
            grasas,
            fibra,
            sodio
          }
        };
      }

      let response;
      if (foodImageFile) {
        const formData = new FormData();
        formData.append("descripcion", foodText.trim());
        formData.append("calorias", calories.toString());
        formData.append("proteina", proteina.toString());
        formData.append("carbohidratos", carbohidratos.toString());
        formData.append("grasas", grasas.toString());
        formData.append("fibra", fibra.toString());
        formData.append("sodio", sodio.toString());
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
            <Box sx={{ mt: 3, border: "2px solid #00ff88", borderRadius: 3, p: 3, bgcolor: "#1a1a1a" }}>
              <Typography sx={{ color: "#00ff88", fontWeight: "bold", fontSize: "1.2rem", mb: 2, textAlign: "center" }}>
                📊 Valores Nutricionales Totales
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 2 }}>
                <TextField
                  type="number"
                  label="🔥 Calorías"
                  value={editableCalories}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
                <TextField
                  type="number"
                  label="💪 Proteína (g)"
                  value={editableProtein}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
                <TextField
                  type="number"
                  label="🌾 Carbohidratos (g)"
                  value={editableCarbs}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
                <TextField
                  type="number"
                  label="🥑 Grasas (g)"
                  value={editableFats}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
                <TextField
                  type="number"
                  label="🥦 Fibra (g)"
                  value={editableFiber}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
                <TextField
                  type="number"
                  label="🧂 Sodio (mg)"
                  value={editableSodium}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' },
                    '& .MuiInputLabel-root': { color: '#00ff88', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#00ff88', borderWidth: 2 },
                      bgcolor: '#2a2a2a'
                    }
                  }}
                />
              </Box>

              {/* 🔥 Sección para agregar alimentos manualmente */}
              <Box sx={{ mt: 2, p: 2, bgcolor: "#222", borderRadius: 1 }}>
                <Typography sx={{ color: "#00ff88", fontWeight: "bold", mb: 1 }}>
                  ➕ Agregar Alimento por Texto
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    value={addFoodText}
                    onChange={(e) => setAddFoodText(e.target.value)}
                    placeholder="Ej: manzana, pollo, arroz..."
                    size="small"
                    sx={{ 
                      flex: 1,
                      '& .MuiInputBase-input': { color: '#fff' },
                      '& .MuiOutlinedInput-root': { 
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#555' }
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFoodByText()}
                  />
                  <Button
                    onClick={handleAddFoodByText}
                    sx={{ bgcolor: "#00ff88", color: "#000" }}
                    disabled={foodAnalyzing}
                  >
                    {foodAnalyzing ? <CircularProgress size={20} /> : "Agregar"}
                  </Button>
                </Box>
              </Box>

              {/* 🔥 NUEVO: Mostrar alimentos detectados individualmente */}
              {((foodAnalysis?.detected_foods && foodAnalysis.detected_foods.length > 0) || manualFoods.length > 0) && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#222", borderRadius: 2, border: "1px solid #333" }}>
                  <Typography sx={{ color: "#00ff88", fontWeight: "bold", mb: 2, fontSize: "1.1em" }}>
                    🍽️ Alimentos en la Comida ({(foodAnalysis?.detected_foods?.length || 0) + manualFoods.length})
                  </Typography>
                  
                  {/* Contenedor con scroll para alimentos */}
                  <Box sx={{ 
                    maxHeight: 300, 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#333',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#555',
                      borderRadius: '3px',
                      '&:hover': {
                        background: '#777',
                      },
                    },
                  }}>
                    {/* Alimentos detectados */}
                    {foodAnalysis?.detected_foods && foodAnalysis.detected_foods.map((food, index) => (
                      <Box key={`detected-${index}`} sx={{ 
                        mb: 1.5, 
                        p: 1.5, 
                        bgcolor: "#333", 
                        borderRadius: 1.5, 
                        border: "1px solid #444",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        transition: "all 0.2s ease",
                        '&:hover': {
                          bgcolor: "#3a3a3a",
                          borderColor: "#555",
                        }
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: "0.95em" }}>
                            {index + 1}. {food.name}
                          </Typography>
                          <Typography sx={{ color: "#ccc", fontSize: "0.75em", mb: 0.5 }}>
                            Confianza: {(food.confidence * 100).toFixed(1)}% | Porción: {food.serving_size}g
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Typography sx={{ color: "#ff6b6b", fontSize: "0.8em", fontWeight: "bold" }}>
                              🔥 {food.nutrition.calories} cal
                            </Typography>
                            <Typography sx={{ color: "#4ecdc4", fontSize: "0.8em" }}>
                              🥩 {food.nutrition.proteina}g
                            </Typography>
                            <Typography sx={{ color: "#ffe66d", fontSize: "0.8em" }}>
                              🌾 {food.nutrition.carbohidratos}g
                            </Typography>
                            <Typography sx={{ color: "#ff9ff3", fontSize: "0.8em" }}>
                              🥑 {food.nutrition.grasas}g
                            </Typography>
                            <Typography sx={{ color: "#54a0ff", fontSize: "0.8em" }}>
                              🥦 {food.nutrition.fibra}g
                            </Typography>
                            <Typography sx={{ color: "#5f27cd", fontSize: "0.8em" }}>
                              🧂 {food.nutrition.sodio}mg
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          onClick={() => handleRemoveFood(index, false)}
                          sx={{ 
                            color: "#ff4444", 
                            minWidth: "auto", 
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: "#ff4444",
                              color: "#fff",
                            }
                          }}
                          size="small"
                        >
                          ✕
                        </Button>
                      </Box>
                    ))}
                    
                    {/* Alimentos manuales */}
                    {manualFoods.map((food, index) => (
                      <Box key={`manual-${index}`} sx={{ 
                        mb: 1.5, 
                        p: 1.5, 
                        bgcolor: "#2a4d69", 
                        borderRadius: 1.5, 
                        border: "1px solid #3a5f7a",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        transition: "all 0.2s ease",
                        '&:hover': {
                          bgcolor: "#3a5f7a",
                          borderColor: "#4a6f8a",
                        }
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: "0.95em" }}>
                            {food.name} <span style={{ color: "#00ff88", fontSize: "0.8em" }}>(manual)</span>
                          </Typography>
                          <Typography sx={{ color: "#ccc", fontSize: "0.75em", mb: 0.5 }}>
                            Porción: {food.serving_size}g
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Typography sx={{ color: "#ff6b6b", fontSize: "0.8em", fontWeight: "bold" }}>
                              🔥 {food.nutrition.calories} cal
                            </Typography>
                            <Typography sx={{ color: "#4ecdc4", fontSize: "0.8em" }}>
                              🥩 {food.nutrition.proteina}g
                            </Typography>
                            <Typography sx={{ color: "#ffe66d", fontSize: "0.8em" }}>
                              🌾 {food.nutrition.carbohidratos}g
                            </Typography>
                            <Typography sx={{ color: "#ff9ff3", fontSize: "0.8em" }}>
                              🥑 {food.nutrition.grasas}g
                            </Typography>
                            <Typography sx={{ color: "#54a0ff", fontSize: "0.8em" }}>
                              🥦 {food.nutrition.fibra}g
                            </Typography>
                            <Typography sx={{ color: "#5f27cd", fontSize: "0.8em" }}>
                              🧂 {food.nutrition.sodio}mg
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          onClick={() => handleRemoveFood(index, true)}
                          sx={{ 
                            color: "#ff4444", 
                            minWidth: "auto", 
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: "#ff4444",
                              color: "#fff",
                            }
                          }}
                          size="small"
                        >
                          ✕
                        </Button>
                      </Box>
                    ))}
                  </Box>
                  
                  {foodAnalysis?.summary && (
                    <Typography sx={{ color: "#aaa", fontSize: "0.85em", mt: 1.5, fontStyle: "italic", textAlign: "center", p: 1, bgcolor: "#1a1a1a", borderRadius: 1 }}>
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