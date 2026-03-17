import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import httpClient, { apiUrl } from "../../app/httpClient";

const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor));
};

const estilos = {
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    border: "1px solid #ccc",
    padding: "10px",
    background: "#f3f3f3",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "left",
  },
  resumenCard: {
    padding: "16px",
    borderRadius: "10px",
    background: "#f8f9fb",
    border: "1px solid #ddd",
    textAlign: "center",
  },
};

const CotizacionVista = () => {
  const navigate = useNavigate();
  const { idCotizacion } = useParams();

  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState(null);

  const [filtroSemana, setFiltroSemana] = useState("");
  const [filtroActividad, setFiltroActividad] = useState("");

  useEffect(() => {
    cargarCotizacion();
  }, [idCotizacion]);

  const cargarCotizacion = async () => {
    try {
      const { json } = await httpClient(
        `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}`
      );

      console.log("Cotización cargada:", json);

      setCotizacion(json);
    } catch (error) {
      console.error("Error cargando cotización:", error);
      alert(
        error?.body?.message ||
          error?.message ||
          "No se pudo cargar la cotización"
      );
    } finally {
      setLoading(false);
    }
  };

  const detalles = cotizacion?.detalles || [];

  const semanasDisponibles = useMemo(() => {
    const semanas = detalles
      .map((item) => item?.semana)
      .filter((s) => s !== null && s !== undefined);

    return [...new Set(semanas)].sort((a, b) => a - b);
  }, [detalles]);

  const actividadesDisponibles = useMemo(() => {
    const actividades = detalles
      .map((item) => item?.actividadMaterial)
      .filter((a) => a && a.trim() !== "");

    return [...new Set(actividades)].sort((a, b) => a.localeCompare(b));
  }, [detalles]);

  const detallesFiltrados = useMemo(() => {
    return detalles.filter((item) => {
      const cumpleSemana =
        filtroSemana === "" || Number(item?.semana) === Number(filtroSemana);

      const cumpleActividad =
        filtroActividad === "" || item?.actividadMaterial === filtroActividad;

      return cumpleSemana && cumpleActividad;
    });
  }, [detalles, filtroSemana, filtroActividad]);

  const totalesFiltrados = useMemo(() => {
    let totalManoObra = 0;
    let totalMateriales = 0;
    let totalProductos = 0;
    let totalGeneral = 0;

    detallesFiltrados.forEach((item) => {
      const subtotal = Number(item?.subtotalVenta || 0);
      totalGeneral += subtotal;

      if (item?.tipoItem === "ACTIVIDAD") {
        totalManoObra += subtotal;
      } else if (item?.tipoItem === "MATERIAL") {
        totalMateriales += subtotal;
      } else if (item?.tipoItem === "PRODUCTO") {
        totalProductos += subtotal;
      }
    });

    return {
      totalManoObra,
      totalMateriales,
      totalProductos,
      totalGeneral,
    };
  }, [detallesFiltrados]);

  const limpiarFiltros = () => {
    setFiltroSemana("SEMANA");
    setFiltroActividad("ACTIVIDAD");
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Cargando cotización...</Typography>
      </Box>
    );
  }

  if (!cotizacion) {
    return (
      <Box p={4}>
        <Typography>No se encontró la cotización.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Cotización #{cotizacion.idCotizacion}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Proyecto: {cotizacion.nombreProyecto}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Estado: <strong>{cotizacion.estado}</strong>
        </Typography>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Mano de Obra</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  filtroSemana || filtroActividad
                    ? totalesFiltrados.totalManoObra
                    : cotizacion.totalManoObra
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Materiales</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  filtroSemana || filtroActividad
                    ? totalesFiltrados.totalMateriales
                    : cotizacion.totalMateriales
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Productos</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  filtroSemana || filtroActividad
                    ? totalesFiltrados.totalProductos
                    : cotizacion.totalProductos
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Estimado</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  filtroSemana || filtroActividad
                    ? totalesFiltrados.totalGeneral
                    : cotizacion.totalEstimado
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Filtros
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por semana"
              value={filtroSemana}
              onChange={(e) => setFiltroSemana(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {semanasDisponibles.map((semana) => (
                <MenuItem key={semana} value={semana}>
                  Semana {semana}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por actividad"
              value={filtroActividad}
              onChange={(e) => setFiltroActividad(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {actividadesDisponibles.map((actividad) => (
                <MenuItem key={actividad} value={actividad}>
                  {actividad}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4} display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/cotizaciones")}
            >
              Volver
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Detalle de la cotización
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={estilos.th}>Servicio</th>
                <th style={estilos.th}>Tipo</th>
                <th style={estilos.th}>Semana</th>
                <th style={estilos.th}>Actividad</th>
                <th style={estilos.th}>Descripción</th>
                <th style={estilos.th}>Cantidad</th>
                <th style={estilos.th}>Precio Unitario</th>
                <th style={estilos.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detallesFiltrados.length > 0 ? (
                detallesFiltrados.map((item) => (
                  <tr key={item.idDetalle}>
                    <td style={estilos.td}>{item.nombreServicio}</td>
                    <td style={estilos.td}>{item.tipoItem}</td>
                    <td style={estilos.td}>{item.semana ?? "-"}</td>
                    <td style={estilos.td}>{item.actividadMaterial ?? "-"}</td>
                    <td style={estilos.td}>{item.descripcion}</td>
                    <td style={estilos.td}>{item.cantidad}</td>
                    <td style={estilos.td}>
                      {formatearMoneda(item.precioUnitarioVenta)}
                    </td>
                    <td style={estilos.td}>
                      {formatearMoneda(item.subtotalVenta)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={estilos.td} colSpan="8">
                    No hay datos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionVista;