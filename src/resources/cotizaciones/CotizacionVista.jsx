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

const formatearNumero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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
    minHeight: "100px",
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
        `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}/vista-completa`
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

  const detallesBase = cotizacion?.detalleBase || cotizacion?.detalles || [];
  const personalizada = cotizacion?.personalizada || null;
  const adicionalesObraBlanca = personalizada?.obraBlanca || [];
  const adicionalesCarpinteria = personalizada?.carpinteria || [];
  const adicionalesVidrio = personalizada?.vidrio || [];
  const adicionalesMeson = personalizada?.mesonGranito || [];

  const semanasDisponibles = useMemo(() => {
    const semanas = detallesBase
      .map((item) => item?.semana)
      .filter((s) => s !== null && s !== undefined);

    return [...new Set(semanas)].sort((a, b) => a - b);
  }, [detallesBase]);

  const actividadesDisponibles = useMemo(() => {
    const actividades = detallesBase
      .map((item) => item?.actividadMaterial)
      .filter((a) => a && a.trim() !== "");

    return [...new Set(actividades)].sort((a, b) => a.localeCompare(b));
  }, [detallesBase]);

  const detallesFiltrados = useMemo(() => {
    return detallesBase.filter((item) => {
      const cumpleSemana =
        filtroSemana === "" || Number(item?.semana) === Number(filtroSemana);

      const cumpleActividad =
        filtroActividad === "" || item?.actividadMaterial === filtroActividad;

      return cumpleSemana && cumpleActividad;
    });
  }, [detallesBase, filtroSemana, filtroActividad]);

  const totalesFiltrados = useMemo(() => {
    let totalManoObra = 0;
    let totalMateriales = 0;
    let totalGeneral = 0;

    detallesFiltrados.forEach((item) => {
      const subtotal = Number(item?.subtotalVenta || 0);
      totalGeneral += subtotal;

      if (item?.tipoItem === "ACTIVIDAD") {
        totalManoObra += subtotal;
      } else if (item?.tipoItem === "MATERIAL") {
        totalMateriales += subtotal;
      } 
    });

    return {
      totalManoObra,
      totalMateriales,
      totalGeneral,
    };
  }, [detallesFiltrados]);

  const limpiarFiltros = () => {
    setFiltroSemana("");
    setFiltroActividad("");
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
          <Grid item xs={12} md={2}>
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

          <Grid item xs={12} md={2}>
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

          <Grid item xs={12} md={2}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Base</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  cotizacion.totalEstimadoBase ?? cotizacion.totalEstimado
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total Adicionales</Typography>
              <Typography variant="h6">
                {formatearMoneda(cotizacion.totalAdicionales ?? 0)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={estilos.resumenCard}>
              <Typography variant="subtitle2">Total General</Typography>
              <Typography variant="h6">
                {formatearMoneda(
                  cotizacion.totalGeneral ??
                    cotizacion.totalEstimado ??
                    0
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
              variant="outlined"
              size="medium"
              sx={{
                minWidth: 260,
                "& .MuiOutlinedInput-root": {
                  minHeight: 45,
                  borderRadius: "10px",
                  backgroundColor: "#14d106",
                },
              }}
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
              variant="outlined"
              size="medium"
              sx={{
                minWidth: 260,
                "& .MuiOutlinedInput-root": {
                  minHeight: 45,
                  borderRadius: "10px",
                  backgroundColor: "#14d106",
                },
              }}
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
              color="success"
              onClick={() => navigate("/cotizaciones")}
            >
              VOLVER
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() =>
                navigate(`/cotizacion-personalizada/formularios/${idCotizacion}`)
              }
            >
              ADICIONAR A COTIZACION
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => navigate(`/cotizaciones/${idCotizacion}/cronograma`)}
            >
              GENERAR CRONOGRAMA
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Detalle de la cotización base
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

        <Typography variant="h5" fontWeight="bold" mt={5} mb={2}>
          Actividades adicionales
        </Typography>

        {adicionalesObraBlanca.length === 0 &&
        adicionalesCarpinteria.length === 0 &&
        adicionalesVidrio.length === 0 &&
        adicionalesMeson.length === 0 ? (
          <Typography>No hay actividades adicionales registradas.</Typography>
        ) : (
          <>
            {adicionalesObraBlanca.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={2}>
                  Mano de Obra / Obra Blanca
                </Typography>

                <Box sx={{ overflowX: "auto" }}>
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Actividad</th>
                        <th style={estilos.th}>Lugar</th>
                        <th style={estilos.th}>Unidad</th>
                        <th style={estilos.th}>Cantidad</th>
                        <th style={estilos.th}>Medida</th>
                        <th style={estilos.th}>Precio Unitario</th>
                        <th style={estilos.th}>Subtotal</th>
                        <th style={estilos.th}>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesObraBlanca.map((item, index) => (
                        <tr key={item.idObraBlanca || index}>
                          <td style={estilos.td}>{item.actividad || "-"}</td>
                          <td style={estilos.td}>{item.lugar || "-"}</td>
                          <td style={estilos.td}>{item.unidad || "-"}</td>
                          <td style={estilos.td}>{item.cantidad ?? "-"}</td>
                          <td style={estilos.td}>{formatearNumero(item.medida)}</td>
                          <td style={estilos.td}>
                            {formatearMoneda(item.precioUnitario)}
                          </td>
                          <td style={estilos.td}>
                            {formatearMoneda(item.subtotal)}
                          </td>
                          <td style={estilos.td}>{item.descripcion || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </>
            )}

            {adicionalesCarpinteria.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Carpintería adicional
                </Typography>
                <Typography>Hay registros adicionales de carpintería.</Typography>
              </>
            )}

            {adicionalesVidrio.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Vidrio adicional
                </Typography>
                <Typography>Hay registros adicionales de vidrio.</Typography>
              </>
            )}

            {adicionalesMeson.length > 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                  Mesón granito adicional
                </Typography>
                <Typography>Hay registros adicionales de mesón.</Typography>
              </>
            )}
          </>
        )}

        <Box mt={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#f8f9fb",
              border: "1px solid #ddd",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen final
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total cotización base:</strong>{" "}
              {formatearMoneda(
                cotizacion.totalEstimadoBase ?? cotizacion.totalEstimado
              )}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Total adicionales:</strong>{" "}
              {formatearMoneda(cotizacion.totalAdicionales ?? 0)}
            </Typography>

            <Typography variant="h6" color="success.main">
              <strong>Total general:</strong>{" "}
              {formatearMoneda(
                cotizacion.totalGeneral ??
                  cotizacion.totalEstimado ??
                  0
              )}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionVista;