import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";

const crearActividadVacia = () => ({
  actividad: "",
  lugar: "",
  cantidad: "",
  medida: "",
  descripcion: "",
});

const FormObraBlanca = ({ data = [], onChange }) => {
  const actividades = Array.isArray(data) && data.length > 0 ? data : [crearActividadVacia()];

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const nuevas = [...actividades];
    nuevas[index] = {
      ...nuevas[index],
      [name]: value,
    };
    onChange(nuevas);
  };

  const agregarActividad = () => {
    onChange([...actividades, crearActividadVacia()]);
  };

  const eliminarActividad = (index) => {
    const nuevas = actividades.filter((_, i) => i !== index);
    onChange(nuevas.length > 0 ? nuevas : [crearActividadVacia()]);
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>
        Formulario Mano de Obra / Obra Blanca
      </Typography>

      {actividades.map((item, index) => (
        <Card key={index} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Actividad {index + 1}
              </Typography>

              {actividades.length > 1 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => eliminarActividad(index)}
                >
                  Eliminar
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Actividad"
                  name="actividad"
                  value={item.actividad || ""}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Lugar"
                  name="lugar"
                  value={item.lugar || ""}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  name="cantidad"
                  value={item.cantidad || ""}
                  onChange={(e) => handleItemChange(index, e)}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Medida"
                  name="medida"
                  value={item.medida || ""}
                  onChange={(e) => handleItemChange(index, e)}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Descripción"
                  name="descripcion"
                  value={item.descripcion || ""}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box mt={2}>
        <Button variant="contained" onClick={agregarActividad}>
          Agregar otra actividad
        </Button>
      </Box>
    </Box>
  );
};

export default FormObraBlanca;