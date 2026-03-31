import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";

const crearActividadVacia = () => ({
  idActividad: "",
  lugar: "",
  cantidad: "",
  medida: "",
  tipoCobro: "",
  precioUnitario: "",
  descripcion: "",
  subtotal: 0,
});

const FormObraBlanca = ({
  actividadesCatalogo = [],
  value = [],
  onChange,
  errors = [],
  titulo = "Formulario Mano de Obra / Obra Blanca",
}) => {
  const [actividades, setActividades] = useState(
    Array.isArray(value) && value.length > 0 ? value : [crearActividadVacia()]
  );

  const [touched, setTouched] = useState({});
  const [intentoAgregar, setIntentoAgregar] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  const catalogoNormalizado = useMemo(() => {
    if (!Array.isArray(actividadesCatalogo)) return [];

    return actividadesCatalogo
      .filter((act) => act?.estado !== false)
      .map((act) => ({
        idActividad: act.idActividad ?? act.id ?? "",
        nombreActividad: act.nombreActividad ?? act.nombre ?? "",
        tipoCobro: act.tipoCobro ?? act.tipo_cobro ?? act.unidadCobro ?? "",
        precioUnitario:
          act.precioUnitario ?? act.precio ?? act.valorUnitario ?? "",
        descripcion:
          act.descripcion ?? act.nombreActividad ?? act.nombre ?? "",
      }));
  }, [actividadesCatalogo]);

  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      setActividades(value);
    }
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(actividades);
    }
  }, [actividades, onChange]);

  const marcarTouched = (index, campo) => {
    setTouched((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [campo]: true,
      },
    }));
  };

  const debeMostrarError = (index, campo) => {
    return touched[index]?.[campo] || intentoAgregar || intentoGuardar;
  };

  const esVacio = (valor) =>
    valor === null || valor === undefined || valor === "";

  const esNumeroValido = (valor) =>
    !esVacio(valor) && !isNaN(Number(valor)) && Number(valor) > 0;

  const esTipoMetro = (tipoCobro = "") =>
    tipoCobro.toUpperCase().includes("METRO CUADRADO");

  const esTipoUnidad = (tipoCobro = "") =>
    tipoCobro.toUpperCase().includes("UNIDAD") ||
    tipoCobro.toUpperCase().includes("OBJETO");

  const getErrorActividad = (item, index) => {
    if (errors?.[index]?.idActividad) return true;
    if (!debeMostrarError(index, "idActividad")) return false;
    return !item.idActividad;
  };

  const getHelperActividad = (item, index) => {
    if (errors?.[index]?.idActividad) return errors[index].idActividad;
    return getErrorActividad(item, index)
      ? "La actividad es obligatoria"
      : " ";
  };

  const getErrorCantidad = (item, index) => {
    if (esTipoMetro(item.tipoCobro)) return false;
    if (!debeMostrarError(index, "cantidad")) return false;
    return !esNumeroValido(item.cantidad);
  };

  const getErrorMedida = (item, index) => {
    if (esTipoUnidad(item.tipoCobro)) return false;
    if (!debeMostrarError(index, "medida")) return false;
    return !esNumeroValido(item.medida);
  };

  const getErrorSubtotal = (item, index) => {
    if (errors?.[index]?.subtotal) return true;

    const filaTieneAlgo =
      item.idActividad ||
      item.lugar?.trim() ||
      item.cantidad !== "" ||
      item.medida !== "" ||
      item.descripcion?.trim() ||
      Number(item.subtotal) > 0;

    if (!filaTieneAlgo) return false;

    return Number(item.subtotal) <= 0;
  };

  const getHelperSubtotal = (item, index) => {
    if (errors?.[index]?.subtotal) return errors[index].subtotal;
    return getErrorSubtotal(item, index)
      ? "El subtotal es obligatorio y debe ser mayor a 0"
      : " ";
  };

  const actividadEsValida = (item) => {
    if (!item.idActividad) return false;

    if (esTipoMetro(item.tipoCobro)) {
      return esNumeroValido(item.medida) && Number(item.subtotal) > 0;
    }

    if (esTipoUnidad(item.tipoCobro)) {
      return esNumeroValido(item.cantidad) && Number(item.subtotal) > 0;
    }

    return (
      esNumeroValido(item.cantidad) &&
      esNumeroValido(item.medida) &&
      Number(item.subtotal) > 0
    );
  };

  const recalcularSubtotal = (actividadActualizada) => {
    const cantidad = Number(actividadActualizada.cantidad || 0);
    const medida = Number(actividadActualizada.medida || 0);
    const precioUnitario = Number(actividadActualizada.precioUnitario || 0);
    const tipoCobro = (actividadActualizada.tipoCobro || "").toUpperCase();

    let subtotal = 0;

    if (tipoCobro.includes("METRO CUADRADO")) {
      subtotal = medida * precioUnitario;
    } else if (tipoCobro.includes("UNIDAD") || tipoCobro.includes("OBJETO")) {
      subtotal = cantidad * precioUnitario;
    } else {
      subtotal = cantidad * precioUnitario;
    }

    return {
      ...actividadActualizada,
      subtotal,
    };
  };

  const handleChange = (index, campo, valor) => {
    const nuevas = [...actividades];
    nuevas[index] = recalcularSubtotal({
      ...nuevas[index],
      [campo]: valor,
    });
    setActividades(nuevas);
  };

  const handleSeleccionActividad = (index, idActividad) => {
    marcarTouched(index, "idActividad");

    const actividadSeleccionada = catalogoNormalizado.find(
      (act) => String(act.idActividad) === String(idActividad)
    );

    const nuevas = [...actividades];

    if (!actividadSeleccionada) {
      nuevas[index] = recalcularSubtotal({
        ...nuevas[index],
        idActividad: "",
        tipoCobro: "",
        precioUnitario: "",
        descripcion: "",
        cantidad: "",
        medida: "",
      });
      setActividades(nuevas);
      return;
    }

    const tipoCobro = actividadSeleccionada.tipoCobro || "";

    nuevas[index] = recalcularSubtotal({
      ...nuevas[index],
      idActividad: actividadSeleccionada.idActividad,
      tipoCobro,
      precioUnitario: actividadSeleccionada.precioUnitario || "",
      descripcion: actividadSeleccionada.descripcion || "",
      cantidad: esTipoMetro(tipoCobro) ? "" : nuevas[index].cantidad,
      medida: esTipoUnidad(tipoCobro) ? "" : nuevas[index].medida,
    });

    setActividades(nuevas);
  };

  const agregarActividad = () => {
    setIntentoAgregar(true);

    const ultima = actividades[actividades.length - 1];
    if (!actividadEsValida(ultima)) {
      return;
    }

    setActividades([...actividades, crearActividadVacia()]);
    setIntentoAgregar(false);
  };

  const eliminarActividad = (index) => {
    if (actividades.length === 1) {
      setActividades([crearActividadVacia()]);
      setTouched({});
      return;
    }

    const nuevas = actividades.filter((_, i) => i !== index);
    setActividades(nuevas);
  };

  const totalGeneral = useMemo(() => {
    return actividades.reduce(
      (acc, item) => acc + Number(item.subtotal || 0),
      0
    );
  }, [actividades]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {titulo}
      </Typography>

      {actividades.map((item, index) => (
        <Card
          key={index}
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Actividad {index + 1}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Actividad"
                  value={item.idActividad ?? ""}
                  onChange={(e) => handleSeleccionActividad(index, e.target.value)}
                  onBlur={() => marcarTouched(index, "idActividad")}
                  error={getErrorActividad(item, index)}
                  helperText={getHelperActividad(item, index)}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }}
                  sx={{ minWidth: 280 }}
                >
                  {catalogoNormalizado.map((act) => (
                    <MenuItem key={act.idActividad} value={act.idActividad}>
                      {act.nombreActividad}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Lugar"
                  value={item.lugar ?? ""}
                  onChange={(e) => handleChange(index, "lugar", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required={!esTipoMetro(item.tipoCobro)}
                  disabled={esTipoMetro(item.tipoCobro)}
                  label="Cantidad"
                  type="number"
                  value={item.cantidad ?? ""}
                  onChange={(e) => handleChange(index, "cantidad", e.target.value)}
                  onBlur={() => marcarTouched(index, "cantidad")}
                  error={getErrorCantidad(item, index)}
                  helperText={
                    esTipoMetro(item.tipoCobro)
                      ? "No aplica para metro cuadrado"
                      : getErrorCantidad(item, index)
                      ? "La cantidad es obligatoria"
                      : " "
                  }
                  inputProps={{ min: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  required={!esTipoUnidad(item.tipoCobro)}
                  disabled={esTipoUnidad(item.tipoCobro)}
                  label="Medida (m²)"
                  type="number"
                  value={item.medida ?? ""}
                  onChange={(e) => handleChange(index, "medida", e.target.value)}
                  onBlur={() => marcarTouched(index, "medida")}
                  error={getErrorMedida(item, index)}
                  helperText={
                    esTipoUnidad(item.tipoCobro)
                      ? "No aplica para unidad"
                      : getErrorMedida(item, index)
                      ? "La medida es obligatoria"
                      : " "
                  }
                  inputProps={{ min: 0.01, step: "any" }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Tipo de cobro"
                  value={item.tipoCobro ?? ""}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Precio unitario"
                  value={item.precioUnitario ?? ""}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={item.descripcion ?? ""}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Subtotal"
                  value={item.subtotal ?? 0}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  error={getErrorSubtotal(item, index)}
                  helperText={getHelperSubtotal(item, index)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => eliminarActividad(index)}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  ELIMINAR ACTIVIDAD
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
        <Button variant="contained" onClick={agregarActividad}>
          AGREGAR OTRA ACTIVIDAD
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">
          Total Actividades: {totalGeneral}
        </Typography>
      </Box>
    </Box>
  );
};

export default FormObraBlanca;