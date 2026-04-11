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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useNotify } from "react-admin";
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
    verticalAlign: "top",
  },
  resumenCard: {
    padding: "16px",
    borderRadius: "10px",
    background: "#f8f9fb",
    border: "1px solid #ddd",
    textAlign: "center",
    minHeight: "100px",
  },
  tdSemana: {
    border: "1px solid #ccc",
    padding: "10px",
   textAlign: "center",
  verticalAlign: "middle",
    fontWeight: "bold",
    background: "#f8f9fb",
  },
  tdActividad: {
    border: "1px solid #ccc",
    padding: "10px",
   textAlign: "center",
  verticalAlign: "middle",
    fontWeight: "bold",
    background: "#fcfcfc",
  },
};

const normalizarTexto = (texto) => {
  return (texto || "").toString().trim().toLowerCase();
};

const construirFilasConRowSpan = (semanas = []) => {
  const filas = [];

  semanas.forEach((semanaObj) => {
    const actividades = semanaObj?.actividades || [];

    const totalFilasSemana =
      actividades.length > 0
        ? actividades.reduce((acc, act) => {
            const materiales = act?.materiales?.length > 0 ? act.materiales.length : 1;
            return acc + materiales;
          }, 0)
        : 1;

    let semanaPintada = false;

    if (actividades.length === 0) {
      filas.push({
        mostrarSemana: true,
        rowSpanSemana: 1,
        semana: semanaObj?.semana,
        totalSemana: semanaObj?.totalSemana,

        mostrarActividad: true,
        rowSpanActividad: 1,
        actividad: "-",
        precioActividad: null,

        cantidad: "",
        material: "",
        precioMaterial: null,
      });

      return;
    }

    actividades.forEach((act) => {
      const materiales = act?.materiales?.length > 0 ? act.materiales : [null];
      const rowSpanActividad = materiales.length;

      materiales.forEach((mat, indexMaterial) => {
        filas.push({
          mostrarSemana: !semanaPintada,
          rowSpanSemana: !semanaPintada ? totalFilasSemana : 0,
          semana: semanaObj?.semana,
          totalSemana: semanaObj?.totalSemana,

          mostrarActividad: indexMaterial === 0,
          rowSpanActividad: indexMaterial === 0 ? rowSpanActividad : 0,
          actividad: act?.actividad || "-",
          precioActividad: act?.precioActividad ?? null,

          cantidad: mat?.cantidad ?? "",
          material: mat?.material ?? "",
          precioMaterial: mat?.precioMaterial ?? null,
        });

        if (!semanaPintada) {
          semanaPintada = true;
        }
      });
    });
  });

  return filas;
};

const CotizacionVista = () => {
  const navigate = useNavigate();
  const { idCotizacion } = useParams();

  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState(null);

  const [filtroSemana, setFiltroSemana] = useState("");
  const [filtroActividad, setFiltroActividad] = useState("");

  const [openAprobar, setOpenAprobar] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [aprobando, setAprobando] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    cargarCotizacion();
  }, [idCotizacion]);

  const cargarCotizacion = async () => {
    try {
      const { json } = await httpClient(
        `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}/vista-completa`
      );

      console.log("Vista completa cargada:", json);
      setCotizacion({
      ...json,
      semanas: json.semanas || [],
    });
    } catch (error) {
      console.warn("Falló vista-completa, intentando cargar cotización base...", error);

      const mensaje = error?.body?.message || error?.message || "";
      const noHayPersonalizada = mensaje.includes("No existe cotización personalizada");

      if (!noHayPersonalizada) {
        alert(mensaje || "No se pudo cargar la cotización");
        setLoading(false);
        return;
      }

      try {
        const { json } = await httpClient(
          `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}`
        );

        console.log("Cotización base cargada:", json);

        setCotizacion({
          idCotizacion: json.idCotizacion,
          nombreProyecto: json.nombreProyecto,
          estado: json.estado,
          totalManoObra: json.totalManoObra ?? 0,
          totalMateriales: json.totalMateriales ?? 0,
          totalProductos: json.totalProductos ?? 0,
          totalEstimado: json.totalEstimado ?? 0,
          totalEstimadoBase: json.totalEstimado ?? 0,
          totalAdicionales: 0,
          totalGeneral: json.totalEstimado ?? 0,
          detalleBase: json.detalles || [],
          semanas: json.semanas || [],
          personalizada: null,
        });
      } catch (errorBase) {
        console.error("Error cargando cotización base:", errorBase);
        alert(
          errorBase?.body?.message ||
            errorBase?.message ||
            "No se pudo cargar la cotización"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    try {
      if (!fechaInicio) {
        notify("Debes seleccionar la fecha de inicio", { type: "warning" });
        return;
      }

      setAprobando(true);

      const token = localStorage.getItem("token");

      await fetch(`${apiUrl}/api/cliente/cotizaciones/${idCotizacion}/aprobar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensaje: "Aprobada por el cliente",
          fechaInicio: fechaInicio,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "No se pudo aprobar la cotización");
        }
        return res.json();
      });

      notify("Cotización aprobada correctamente", { type: "success" });
      setOpenAprobar(false);

      navigate(`/cronogramas/cotizacion/${idCotizacion}`);
    } catch (error) {
      console.error(error);
      notify(error.message || "Error al aprobar la cotización", { type: "error" });
    } finally {
      setAprobando(false);
    }
  };

  const personalizada = cotizacion?.personalizada || null;
  const adicionalesObraBlanca = personalizada?.obraBlanca || [];
  const adicionalesCarpinteria = personalizada?.carpinteria || [];
  const adicionalesVidrio = personalizada?.vidrio || [];
  const adicionalesMeson = personalizada?.mesonGranito || [];

  const semanasBase = useMemo(() => {
    return cotizacion?.semanas || [];
  }, [cotizacion]);

  const semanasDisponibles = useMemo(() => {
    const semanas = semanasBase
      .map((item) => item?.semana)
      .filter((s) => s !== null && s !== undefined);

    return [...new Set(semanas)].sort((a, b) => a - b);
  }, [semanasBase]);

  const actividadesDisponibles = useMemo(() => {
    const actividades = [];

    semanasBase.forEach((semana) => {
      (semana?.actividades || []).forEach((act) => {
        if (act?.actividad && act.actividad.trim() !== "") {
          actividades.push(act.actividad);
        }
      });
    });

    return [...new Set(actividades)].sort((a, b) => a.localeCompare(b));
  }, [semanasBase]);

  const semanasFiltradas = useMemo(() => {
    return semanasBase
      .filter((semanaObj) => {
        const cumpleSemana =
          filtroSemana === "" || Number(semanaObj?.semana) === Number(filtroSemana);

        if (!cumpleSemana) return false;

        if (filtroActividad === "") return true;

        return (semanaObj?.actividades || []).some(
          (act) => normalizarTexto(act?.actividad) === normalizarTexto(filtroActividad)
        );
      })
      .map((semanaObj) => {
        const actividades = (semanaObj?.actividades || []).filter((act) => {
          if (filtroActividad === "") return true;
          return normalizarTexto(act?.actividad) === normalizarTexto(filtroActividad);
        });

        return {
          ...semanaObj,
          actividades,
        };
      })
      .filter((semanaObj) => (semanaObj?.actividades || []).length > 0);
  }, [semanasBase, filtroSemana, filtroActividad]);

  const filasTabla = useMemo(() => {
    return construirFilasConRowSpan(semanasFiltradas);
  }, [semanasFiltradas]);

  const totalesFiltrados = useMemo(() => {
    let totalManoObra = 0;
    let totalMateriales = 0;
    let totalGeneral = 0;

    semanasFiltradas.forEach((semanaObj) => {
      totalManoObra += Number(semanaObj?.totalManoObra || 0);
      totalMateriales += Number(semanaObj?.totalMateriales || 0);
      totalGeneral += Number(semanaObj?.totalSemana || 0);
    });

    return {
      totalManoObra,
      totalMateriales,
      totalGeneral,
    };
  }, [semanasFiltradas]);

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
                  cotizacion.totalGeneral ?? cotizacion.totalEstimado ?? 0
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenAprobar(true)}
          disabled={
            cotizacion?.estado === "APROBADA" || cotizacion?.estado === "RECHAZADA"
          }
        >
          APROBAR
        </Button>

        <Typography variant="h5" fontWeight="bold" mb={2} mt={4}>
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
              disabled={
                cotizacion?.estado === "APROBADA" || cotizacion?.estado === "RECHAZADA"
              }
            >
              ADICIONAR A COTIZACION
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
                <th style={estilos.th}>Semana</th>
                <th style={estilos.th}>Valor semana</th>
                <th style={estilos.th}>Actividad</th>
                <th style={estilos.th}>Valor actividad</th>
                <th style={estilos.th}>Cantidad</th>
                <th style={estilos.th}>Material</th>
                <th style={estilos.th}>Precio material</th>
              </tr>
            </thead>
            <tbody>
              {filasTabla.length > 0 ? (
                filasTabla.map((fila, index) => (
                  <tr key={index}>
                    {fila.mostrarSemana && (
                      <td style={estilos.tdSemana} rowSpan={fila.rowSpanSemana}>
                        Semana {fila.semana}
                      </td>
                    )}

                    {fila.mostrarSemana && (
                      <td style={estilos.tdSemana} rowSpan={fila.rowSpanSemana}>
                        {formatearMoneda(fila.totalSemana)}
                      </td>
                    )}

                    {fila.mostrarActividad && (
                      <td style={estilos.tdActividad} rowSpan={fila.rowSpanActividad}>
                        {fila.actividad}
                      </td>
                    )}

                    {fila.mostrarActividad && (
                      <td style={estilos.tdActividad} rowSpan={fila.rowSpanActividad}>
                        {formatearMoneda(fila.precioActividad)}
                      </td>
                    )}

                    <td style={estilos.td}>
                      {fila.cantidad !== "" ? formatearNumero(fila.cantidad) : "-"}
                    </td>

                    <td style={estilos.td}>{fila.material || "-"}</td>

                    <td style={estilos.td}>
                      {fila.precioMaterial !== null
                        ? formatearMoneda(fila.precioMaterial)
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={estilos.td} colSpan="7">
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
                cotizacion.totalGeneral ?? cotizacion.totalEstimado ?? 0
              )}
            </Typography>
          </Paper>
        </Box>

        <Dialog
          open={openAprobar}
          onClose={() => setOpenAprobar(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Aprobar cotización</DialogTitle>

          <DialogContent>
            <TextField
              label="Fecha de inicio"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenAprobar(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAprobar}
              disabled={aprobando}
            >
              {aprobando ? "Aprobando..." : "Confirmar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CotizacionVista;