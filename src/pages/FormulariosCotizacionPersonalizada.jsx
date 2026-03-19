import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../app/httpClient";

import FormObraBlanca from "../resources/Formularios/FormObraBlanca";
import FormCarpinteria from "../resources/Formularios/FormCarpinteria";
import FormVidrio from "../resources/Formularios/FormVidrio";
import FormMezon from "../resources/Formularios/FormMezon";

const FormulariosCotizacionPersonalizada = () => {
  const { idSolicitud } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [idCotizacion, setIdCotizacion] = useState(null);

  const [obraBlanca, setObraBlanca] = useState([
    {
      actividad: "",
      lugar: "",
      cantidad: "",
      medida: "",
      descripcion: "",
    },
  ]);

  const [carpinteria, setCarpinteria] = useState({
    tipoMueble: "",
    material: "",
    largo: "",
    ancho: "",
    alto: "",
    cantidad: "",
    precioUnitario: "",
    descripcion: "",
  });

  const [vidrio, setVidrio] = useState({
    tipoVidrio: "",
    ancho: "",
    alto: "",
    cantidad: "",
    instalacion: false,
    precioUnitario: "",
    descripcion: "",
  });

  const [meson, setMeson] = useState({
    tipoGranito: "",
    largo: "",
    ancho: "",
    espesor: "",
    cantidad: "",
    precioUnitario: "",
    descripcion: "",
  });

  const nombreProyecto = useMemo(() => {
    return (
      solicitud?.nombreProyecto ||
      solicitud?.nombreProyectoUsuario ||
      localStorage.getItem("nombreProyecto") ||
      ""
    );
  }, [solicitud]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [idSolicitud]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      const serviciosLS = JSON.parse(
        localStorage.getItem("serviciosSeleccionados") || "[]"
      );

      if (Array.isArray(serviciosLS) && serviciosLS.length > 0) {
        setServiciosSeleccionados(serviciosLS);
      }

      const { json } = await httpClient(`${apiUrl}/api/solicitudes/${idSolicitud}`, {
        method: "GET",
      });

      setSolicitud(json);

      if ((!serviciosLS || serviciosLS.length === 0) && json?.servicios) {
        setServiciosSeleccionados(json.servicios);
      }
    } catch (error) {
      console.error("Error cargando solicitud:", error);
      notify("No fue posible cargar la solicitud", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };

  const crearCotizacionSiNoExiste = async () => {
    if (idCotizacion) return idCotizacion;

    const payload = {
      idSolicitud: Number(idSolicitud),
      nombreProyecto: nombreProyecto,
      observacionGeneral: "Cotización personalizada generada desde formularios",
    };

    const { json } = await httpClient(`${apiUrl}/api/cotizaciones-personalizadas`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    setIdCotizacion(json.idCotizacion);
    return json.idCotizacion;
  };

  const guardarObraBlanca = async (cotizacionId) => {
    if (!serviciosSeleccionados.includes(1)) return;

    const actividadesValidas = obraBlanca.filter(
      (item) =>
        item.actividad?.trim() ||
        item.lugar?.trim() ||
        item.cantidad !== "" ||
        item.medida !== "" ||
        item.descripcion?.trim()
    );

    for (const item of actividadesValidas) {
      const payload = {
        idCotizacion: cotizacionId,
        actividad: item.actividad,
        lugar: item.lugar,
        unidad: null,
        cantidad: toNumberOrNull(item.cantidad),
        semanas: null,
        precioUnitario: null,
        medida: toNumberOrNull(item.medida),
        descripcion: item.descripcion,
      };

      await httpClient(`${apiUrl}/api/obra-blanca`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });
    }
  };

  const guardarCarpinteria = async (cotizacionId) => {
    if (!serviciosSeleccionados.includes(2)) return;

    const payload = {
      idCotizacion: cotizacionId,
      tipoMueble: carpinteria.tipoMueble,
      material: carpinteria.material,
      largo: toNumberOrNull(carpinteria.largo),
      ancho: toNumberOrNull(carpinteria.ancho),
      alto: toNumberOrNull(carpinteria.alto),
      cantidad: toNumberOrNull(carpinteria.cantidad),
      precioUnitario: toNumberOrNull(carpinteria.precioUnitario),
      descripcion: carpinteria.descripcion,
    };

    await httpClient(`${apiUrl}/api/carpinteria`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  };

  const guardarVidrio = async (cotizacionId) => {
    if (!serviciosSeleccionados.includes(3)) return;

    const payload = {
      idCotizacion: cotizacionId,
      tipoVidrio: vidrio.tipoVidrio,
      ancho: toNumberOrNull(vidrio.ancho),
      alto: toNumberOrNull(vidrio.alto),
      cantidad: toNumberOrNull(vidrio.cantidad),
      instalacion: vidrio.instalacion,
      precioUnitario: toNumberOrNull(vidrio.precioUnitario),
      descripcion: vidrio.descripcion,
    };

    await httpClient(`${apiUrl}/api/vidrio`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  };

  const guardarMeson = async (cotizacionId) => {
    if (!serviciosSeleccionados.includes(4)) return;

    const payload = {
      idCotizacion: cotizacionId,
      tipoGranito: meson.tipoGranito,
      largo: toNumberOrNull(meson.largo),
      ancho: toNumberOrNull(meson.ancho),
      espesor: toNumberOrNull(meson.espesor),
      cantidad: toNumberOrNull(meson.cantidad),
      precioUnitario: toNumberOrNull(meson.precioUnitario),
      descripcion: meson.descripcion,
    };

    await httpClient(`${apiUrl}/api/meson-granito`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  };

  const guardarTodosLosFormularios = async (cotizacionId) => {
    await guardarObraBlanca(cotizacionId);
    await guardarCarpinteria(cotizacionId);
    await guardarVidrio(cotizacionId);
    await guardarMeson(cotizacionId);
  };

  const recalcularCotizacion = async (cotizacionId) => {
    await httpClient(`${apiUrl}/api/cotizaciones-personalizadas/${cotizacionId}/recalcular`, {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
  };

  const handleGuardarTodo = async () => {
    try {
      setGuardando(true);

      const cotizacionId = await crearCotizacionSiNoExiste();
      await guardarTodosLosFormularios(cotizacionId);
      await recalcularCotizacion(cotizacionId);

      notify("Formularios guardados correctamente", { type: "success" });
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message || error?.message || "Error al guardar los formularios",
        { type: "error" }
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleGenerarYVer = async () => {
    try {
      setGuardando(true);

      const cotizacionId = await crearCotizacionSiNoExiste();
      await guardarTodosLosFormularios(cotizacionId);
      await recalcularCotizacion(cotizacionId);

      notify("Cotización personalizada generada correctamente", {
        type: "success",
      });

      navigate(`/cotizaciones-personalizadas/${cotizacionId}/detalle`);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message || error?.message || "Error al generar la cotización",
        { type: "error" }
      );
    } finally {
      setGuardando(false);
    }
  };

  const nombresServicios = serviciosSeleccionados
    .map((id) => {
      if (id === 1) return "Mano de Obra";
      if (id === 2) return "Carpintería";
      if (id === 3) return "Divisiones en Vidrio";
      if (id === 4) return "Mesón Granito";
      return "";
    })
    .filter(Boolean)
    .join(", ");

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando formularios...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 1100, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Cotización Personalizada
          </Typography>

          <Box
            mb={3}
            p={2}
            sx={{
              backgroundColor: "#f5f8ff",
              borderRadius: 2,
              border: "1px solid #dbe7ff",
            }}
          >
            <Typography>
              <strong>Solicitud:</strong> {idSolicitud}
            </Typography>
            <Typography>
              <strong>Proyecto:</strong> {nombreProyecto || "Sin nombre"}
            </Typography>
            <Typography>
              <strong>Servicios seleccionados:</strong> {nombresServicios || "Ninguno"}
            </Typography>
          </Box>

          {serviciosSeleccionados.includes(1) && (
            <FormObraBlanca data={obraBlanca} onChange={setObraBlanca} />
          )}

          {serviciosSeleccionados.includes(2) && (
            <FormCarpinteria data={carpinteria} onChange={setCarpinteria} />
          )}

          {serviciosSeleccionados.includes(3) && (
            <FormVidrio data={vidrio} onChange={setVidrio} />
          )}

          {serviciosSeleccionados.includes(4) && (
            <FormMezon data={meson} onChange={setMeson} />
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              variant="outlined"
              onClick={() => navigate("/solicitudes")}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              variant="outlined"
              onClick={handleGuardarTodo}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar formularios"}
            </Button>

            <Button
              variant="contained"
              onClick={handleGenerarYVer}
              disabled={guardando}
              sx={{
                backgroundColor: "#0aa000",
                "&:hover": { backgroundColor: "#088500" },
              }}
            >
              {guardando ? "Procesando..." : "Generar y ver cotización"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormulariosCotizacionPersonalizada;