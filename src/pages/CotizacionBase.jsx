import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import httpClient, { apiUrl } from "../app/httpClient";

const tiposCielo = ["ESTUCO", "DRYWALL"];
const tiposApertura = ["CORREDIZA", "BATIENTE"];
const coloresAccesorios = ["NEGRO", "BLANCO"];

const CotizacionBase = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  const [formDataManoObra, setFormDataManoObra] = useState({
    medidaAreaPrivada: "",
    cantidadBanos: "",
    tipoCielo: "ESTUCO",
    divisionPared: false,
    
  });

  const [formDataCarpinteria, setFormDataCarpinteria] = useState({
    cantidadCloset: "",
    cantidadPuertas: "",
    muebleAltoCocina: "",
    muebleBajoCocina: "",
    cantidadMuebleBano: "",
  });

  const [formDataVidrio, setFormDataVidrio] = useState({
    cantidadBanos: "",
    tipoApertura: "",
    colorAccesorios: "",
  });

  const [formDataMezon, setFormDataMezon] = useState({
    mezonCocina: "",
    mezonBarra: "",
    mezonLavamanos: "",
  });

  useEffect(() => {
    cargarSolicitud();
  }, []);

  const cargarSolicitud = async () => {
    try {
      const idSolicitud = localStorage.getItem("idSolicitud");

      if (!idSolicitud) {
        alert("No se encontró idSolicitud.");
        navigate("/solicitudes");
        return;
      }

      const { json } = await httpClient(`${apiUrl}/api/solicitudes/${idSolicitud}`);
      const data = json;

      console.log("Solicitud cargada:", data);

      const servicios =
        data?.solicitudServicios ||
        data?.servicios ||
        data?.serviciosSeleccionados ||
        data?.detalleServicios ||
        [];

      console.log("Servicios detectados:", servicios);

      setServiciosSeleccionados(servicios);
    } catch (error) {
      console.error("Error al cargar solicitud:", error);
      alert("No se pudo cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerIdServicio = (s) => {
    return (
      s?.idServicio ||
      s?.id_servicio ||
      s?.idServicios ||
      s?.id_servicios ||
      s?.servicios?.idServicio ||
      s?.servicios?.id_servicios ||
      s?.servicios?.idServicios ||
      s?.servicio?.idServicio ||
      s?.servicio?.id_servicios ||
      s?.servicio?.idServicios ||
      null
    );
  };

  const idsServicios = serviciosSeleccionados
    .map(obtenerIdServicio)
    .filter(Boolean);

  const seccionManoObraVisible = idsServicios.includes(1);
  const seccionCarpinteriaVisible = idsServicios.includes(2);
  const seccionVidrioVisible = idsServicios.includes(3);
  const seccionMezonVisible = idsServicios.includes(4);

  const handleChangeManoObra = (e) => {
    const { name, value } = e.target;
    setFormDataManoObra((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchManoObra = (e) => {
    const { name, checked } = e.target;
    setFormDataManoObra((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleChangeCarpinteria = (e) => {
    const { name, value } = e.target;
    setFormDataCarpinteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeVidrio = (e) => {
    const { name, value } = e.target;
    setFormDataVidrio((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeMezon = (e) => {
    const { name, value } = e.target;
    setFormDataMezon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (seccionManoObraVisible) {
      if (!formDataManoObra.medidaAreaPrivada) {
        alert("Debe ingresar la medida del área privada.");
        return false;
      }
      if (!formDataManoObra.cantidadBanos) {
        alert("Debe ingresar la cantidad de baños.");
        return false;
      }
      if (!formDataManoObra.tipoCielo) {
        alert("Debe seleccionar el tipo de cielo.");
        return false;
      }
    }

    if (seccionVidrioVisible) {
      if (!formDataVidrio.cantidadBanos) {
        alert("Debe ingresar la cantidad de baños en vidrio.");
        return false;
      }
      if (!formDataVidrio.tipoApertura) {
        alert("Debe seleccionar el tipo de apertura.");
        return false;
      }
      if (!formDataVidrio.colorAccesorios) {
        alert("Debe seleccionar el color de accesorios.");
        return false;
      }
    }

    return true;
  };

  const handleGenerarCotizacion = async () => {
    try {
      if (!validarFormulario()) return;

      const idSolicitud = localStorage.getItem("idSolicitud");

      const payload = {
        solicitudId: Number(idSolicitud),
        manoObra: seccionManoObraVisible
          ? {
              medidaAreaPrivada: formDataManoObra.medidaAreaPrivada
                ? Number(formDataManoObra.medidaAreaPrivada)
                : null,
              cantidadBanos: formDataManoObra.cantidadBanos
                ? Number(formDataManoObra.cantidadBanos)
                : null,
              tipoCielo: formDataManoObra.tipoCielo || null,
              divisionPared: !!formDataManoObra.divisionPared,

              metrosCuadradosPanelYeso: 20,
              cantidadPoyos: 3,
              cantidadPuntosElectricos: 4,
              metrosCuadradosMuro: 12,
              metrosCuadradosCielo: 18,
              metrosCuadradosTaparTuberias: 6
            }
          : null,
        carpinteria: seccionCarpinteriaVisible
          ? {
              cantidadCloset: formDataCarpinteria.cantidadCloset
                ? Number(formDataCarpinteria.cantidadCloset)
                : null,
              cantidadPuertas: formDataCarpinteria.cantidadPuertas
                ? Number(formDataCarpinteria.cantidadPuertas)
                : null,
              muebleAltoCocina: formDataCarpinteria.muebleAltoCocina
                ? Number(formDataCarpinteria.muebleAltoCocina)
                : null,
              muebleBajoCocina: formDataCarpinteria.muebleBajoCocina
                ? Number(formDataCarpinteria.muebleBajoCocina)
                : null,
              cantidadMuebleBano: formDataCarpinteria.cantidadMuebleBano
                ? Number(formDataCarpinteria.cantidadMuebleBano)
                : null,
            }
          : null,
        vidrio: seccionVidrioVisible
          ? {
              cantidadBanos: formDataVidrio.cantidadBanos
                ? Number(formDataVidrio.cantidadBanos)
                : null,
              tipoApertura: formDataVidrio.tipoApertura || null,
              colorAccesorios: formDataVidrio.colorAccesorios || null,
            }
          : null,
        mezon: seccionMezonVisible
          ? {
              mezonCocina: formDataMezon.mezonCocina
                ? Number(formDataMezon.mezonCocina)
                : null,
              mezonBarra: formDataMezon.mezonBarra
                ? Number(formDataMezon.mezonBarra)
                : null,
              mezonLavamanos: formDataMezon.mezonLavamanos
                ? Number(formDataMezon.mezonLavamanos)
                : null,
            }
          : null,
      };

      console.log("Payload generar cotización:", payload);

      const { json } = await httpClient(`${apiUrl}/api/cliente/cotizaciones/generar-base`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Respuesta generar cotización:", json);

      if (!json?.idCotizacion) {
        alert("La cotización se guardó, pero no llegó el idCotizacion.");
        return;
      }

      navigate(`/cotizaciones/${json.idCotizacion}/vista`);
    } catch (error) {
      console.error("Error al generar cotización:", error);
      alert(
        error?.body?.message ||
          error?.message ||
          "Ocurrió un error al generar la cotización"
      );
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando información...</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Cotización Base
        </Typography>

        <Typography variant="h6" sx={{ mb: 4 }}>
          Complete la información según los servicios seleccionados en la solicitud.
        </Typography>

        {seccionManoObraVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Mano de Obra
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Medida área privada"
                  name="medidaAreaPrivada"
                  value={formDataManoObra.medidaAreaPrivada}
                  onChange={handleChangeManoObra}
                  type="number"
                  inputProps={{ min: 0 }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cantidad baños"
                  name="cantidadBanos"
                  value={formDataManoObra.cantidadBanos}
                  onChange={handleChangeManoObra}
                  type="number"
                  inputProps={{ min: 0 }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de cielo"
                  name="tipoCielo"
                  value={formDataManoObra.tipoCielo}
                  onChange={handleChangeManoObra}
                  variant="standard"
                >
                  {tiposCielo.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataManoObra.divisionPared}
                      onChange={handleSwitchManoObra}
                      name="divisionPared"
                    />
                  }
                  label="¿División en pared?"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {seccionCarpinteriaVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Carpintería
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad closet"
                  name="cantidadCloset"
                  value={formDataCarpinteria.cantidadCloset}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad puertas"
                  name="cantidadPuertas"
                  value={formDataCarpinteria.cantidadPuertas}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mueble alto cocina"
                  name="muebleAltoCocina"
                  value={formDataCarpinteria.muebleAltoCocina}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mueble bajo cocina"
                  name="muebleBajoCocina"
                  value={formDataCarpinteria.muebleBajoCocina}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad mueble baño"
                  name="cantidadMuebleBano"
                  value={formDataCarpinteria.cantidadMuebleBano}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {seccionVidrioVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Divisiones en Vidrio
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad baños"
                  name="cantidadBanos"
                  value={formDataVidrio.cantidadBanos}
                  onChange={handleChangeVidrio}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Tipo apertura"
                  name="tipoApertura"
                  value={formDataVidrio.tipoApertura}
                  onChange={handleChangeVidrio}
                  variant="standard"
                >
                  {tiposApertura.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Color accesorios"
                  name="colorAccesorios"
                  value={formDataVidrio.colorAccesorios}
                  onChange={handleChangeVidrio}
                  variant="standard"
                >
                  {coloresAccesorios.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {seccionMezonVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Mesón
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mesón cocina"
                  name="mezonCocina"
                  value={formDataMezon.mezonCocina}
                  onChange={handleChangeMezon}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mesón barra"
                  name="mezonBarra"
                  value={formDataMezon.mezonBarra}
                  onChange={handleChangeMezon}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mesón lavamanos"
                  name="mezonLavamanos"
                  value={formDataMezon.mezonLavamanos}
                  onChange={handleChangeMezon}
                  type="number"
                  variant="standard"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        <Box
          mt={4}
          display="flex"
          justifyContent="flex-end"
          gap={2}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/solicitudes")}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleGenerarCotizacion}
          >
            GENERAR COTIZACIÓN
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionBase;