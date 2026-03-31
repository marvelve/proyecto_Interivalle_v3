import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const CronogramaVista = () => {
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [cronograma, setCronograma] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCronograma = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${apiUrl}/api/cliente/cronogramas/cotizacion/${idCotizacion}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "No se pudo cargar el cronograma");
        }

        setCronograma(data);
      } catch (error) {
        console.error(error);
        notify(error.message || "Error cargando cronograma", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    cargarCronograma();
  }, [idCotizacion, notify]);

  const colorEstado = (estado) => {
    switch (estado) {
      case "TERMINADA":
        return "success";
      case "ATRASADA":
        return "error";
      case "EN_PROCESO":
        return "warning";
      case "PENDIENTE":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!cronograma) {
    return (
      <Box p={4}>
        <Typography>No se encontró el cronograma.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Cronograma de Cotización #{cronograma.idCotizacion}
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Proyecto</Typography>
            <Typography variant="h6">{cronograma.proyecto}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Estado Cronograma</Typography>
            <Typography variant="h6">{cronograma.estadoCronograma}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Fecha Inicio</Typography>
            <Typography variant="h6">{cronograma.fechaInicio}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Inicio Planificado</Typography>
            <Typography variant="h6">{cronograma.fechaInicioPlanificada}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Fecha Fin</Typography>
            <Typography variant="h6">{cronograma.fechaFinEstimada}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mb={2}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          VOLVER
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Servicio</TableCell>
              <TableCell>Actividad</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Semana</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Trabajador</TableCell>
              <TableCell>%</TableCell>
              <TableCell>Novedades</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cronograma.detalles?.map((item) => (
              <TableRow key={item.idCronogramaDetalle}>
                <TableCell>{item.servicio}</TableCell>
                <TableCell>{item.actividad}</TableCell>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell>{item.semana}</TableCell>
                <TableCell>{item.fechaInicioSemana}</TableCell>
                <TableCell>{item.fechaFinSemana}</TableCell>
                <TableCell>
                  <Chip label={item.estadoActividad} color={colorEstado(item.estadoActividad)} />
                </TableCell>
                <TableCell>{item.trabajadorAsignado || "-"}</TableCell>
                <TableCell>{item.porcentaje ?? 0}%</TableCell>
                <TableCell>{item.novedades || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CronogramaVista;