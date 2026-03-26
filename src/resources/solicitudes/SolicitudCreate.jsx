import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const serviciosDisponibles = [
  { id: 1, nombre: "Mano de Obra" },
  { id: 2, nombre: "Carpintería" },
  { id: 3, nombre: "Divisiones en Vidrio" },
  { id: 4, nombre: "Mesón Granito" }
];

const tiposSolicitud = [
  { value: "COTIZACION_BASE", label: "Cotización Base" },
  { value: "VISITA_TECNICA", label: "Visita Técnica" }
];

const SolicitudCreate = () => {
  const navigate = useNavigate();
  const notify = useNotify();

  const correoUsuario = localStorage.getItem("correoUsuario");

  const [formData, setFormData] = React.useState({
    tipoSolicitud: "COTIZACION_BASE",
    nombreProyecto: ""
  });

  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [idSolicitud, setIdSolicitud] = React.useState(null);

  React.useEffect(() => {
    localStorage.removeItem("idSolicitud");
    localStorage.removeItem("serviciosSeleccionados");
    localStorage.removeItem("tipoSolicitud");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "nombreProyecto" ? value.toUpperCase() : value
    });
  };

  const handleServicioChange = (id) => {
    if (serviciosSeleccionados.includes(id)) {
      setServiciosSeleccionados(serviciosSeleccionados.filter((s) => s !== id));
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, id]);
    }
  };

  const validarFormulario = () => {
    if (!formData.tipoSolicitud) {
      notify("Seleccione el tipo de solicitud", { type: "warning" });
      return false;
    }

    if (!formData.nombreProyecto || !formData.nombreProyecto.trim()) {
      notify("Ingrese el nombre del proyecto", { type: "warning" });
      return false;
    }

    if (
      (formData.tipoSolicitud === "COTIZACION_BASE") &&
      serviciosSeleccionados.length === 0
    ) {
      notify("Seleccione al menos un servicio", { type: "warning" });
      return false;
    }

    return true;
  };

  const construirPayload = () => {
    return {
      correoUsuario,
      tipoSolicitud: formData.tipoSolicitud,
      nombreProyecto: formData.nombreProyecto.trim(),
      servicios: serviciosSeleccionados
    };
  };

  const guardarEnLocalStorage = (solicitudId) => {
    localStorage.setItem("idSolicitud", solicitudId);
    localStorage.setItem(
      "serviciosSeleccionados",
      JSON.stringify(serviciosSeleccionados)
    );
    localStorage.setItem("tipoSolicitud", formData.tipoSolicitud);
    localStorage.setItem("nombreProyecto", formData.nombreProyecto.trim());
  };

  const redirigirSegunTipo = (solicitudId) => {
    if (formData.tipoSolicitud === "COTIZACION_BASE") {
      navigate("/cotizacion-base");
    } else {
      navigate("/visita-tecnica");
    }
  };

  const crearNuevaSolicitud = async () => {
    const payload = construirPayload();

    console.log("Payload solicitud:", payload);

    const { json } = await httpClient(`${apiUrl}/api/solicitudes`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });

    console.log("Solicitud creada:", json);

    if (!json?.idSolicitud) {
      throw new Error("La solicitud se creó, pero no se recibió el idSolicitud");
    }

    return json;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const json = await crearNuevaSolicitud();

      setIdSolicitud(json.idSolicitud);
      guardarEnLocalStorage(json.idSolicitud);

      notify("Solicitud guardada en estado PENDIENTE", { type: "success" });

      navigate("/solicitudes");
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al guardar la solicitud",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCotizacion = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const json = await crearNuevaSolicitud();
      const solicitudIdNueva = json.idSolicitud;

      setIdSolicitud(solicitudIdNueva);
      guardarEnLocalStorage(solicitudIdNueva);

      const { json: jsonGenerada } = await httpClient(
        `${apiUrl}/api/solicitudes/${solicitudIdNueva}/generar`,
        {
          method: "PUT",
          headers: new Headers({
            "Content-Type": "application/json"
          })
        }
      );

      console.log("Solicitud generada:", jsonGenerada);

      notify("Cotización creada correctamente. Estado: GENERADA", {
        type: "success"
      });

      redirigirSegunTipo(solicitudIdNueva);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al crear la Solicitud",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Crear Solicitud
          </Typography>

          <Box component="form" onSubmit={(e) => e.preventDefault()}>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de Solicitud"
                  name="tipoSolicitud"
                  value={formData.tipoSolicitud}
                  onChange={handleChange}
                >
                  {tiposSolicitud.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Proyecto"
                  name="nombreProyecto"
                  value={formData.nombreProyecto}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" mb={1}>
              Seleccione los servicios a cotizar
            </Typography>

            <Grid container>
              {serviciosDisponibles.map((servicio) => (
                <Grid item xs={12} md={6} key={servicio.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={serviciosSeleccionados.includes(servicio.id)}
                        onChange={() => handleServicioChange(servicio.id)}
                      />
                    }
                    label={servicio.nombre}
                  />
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/solicitudes")}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                variant="outlined"
                onClick={handleGuardar}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                variant="contained"
                onClick={handleCrearCotizacion}
                disabled={loading}
                sx={{
                  backgroundColor: "#0aa000",
                  "&:hover": { backgroundColor: "#088500" }
                }}
              >
                {loading ? "Procesando..." : "Crear Solicitud"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudCreate;