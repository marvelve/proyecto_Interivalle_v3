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
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [solicitud, setSolicitud] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [idSolicitud, setIdSolicitud] = useState(null);
  const [actividadesCatalogo, setActividadesCatalogo] = useState([]);
  const [idCotizacionPersonalizada, setIdCotizacionPersonalizada] = useState(null);
  const [obraBlanca, setObraBlanca] = useState([
    {
      idActividad: "",
      lugar: "",
      cantidad: "",
      medida: "",
      tipoCobro: "",
      precioUnitario: "",
      descripcion: "",
      subtotal: 0,
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
      cotizacion?.nombreProyecto ||
      solicitud?.nombreProyecto ||
      solicitud?.nombreProyectoUsuario ||
      localStorage.getItem("nombreProyecto") ||
      ""
    );
  }, [cotizacion, solicitud]);

  const actividadesObraBlanca = useMemo(() => {
    return actividadesCatalogo.filter((item) => {
      const idServicio = item?.servicios?.idServicio;
      const nombreServicio = (item?.servicios?.nombreServicio || "").toUpperCase();
      const estado = item?.estado;

      return (
        estado === true &&
        (Number(idServicio) === 1 ||
          nombreServicio.includes("MANO DE OBRA BLANCA") ||
          nombreServicio.includes("MANO DE OBRA"))
      );
    });
  }, [actividadesCatalogo]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [idCotizacion]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      const serviciosLS = JSON.parse(
        localStorage.getItem("serviciosSeleccionados") || "[]"
      );

      if (Array.isArray(serviciosLS) && serviciosLS.length > 0) {
        setServiciosSeleccionados(serviciosLS);
      }

      try {
        const { json: catalogoJson } = await httpClient(
          `${apiUrl}/api/actividades-personalizadas`,
          {
            method: "GET",
          }
        );

        console.log("Catálogo actividades:", catalogoJson);
        setActividadesCatalogo(Array.isArray(catalogoJson) ? catalogoJson : []);
      } catch (errorCatalogo) {
        console.warn("No fue posible cargar el catálogo de actividades:", errorCatalogo);
      }

      try {
        const { json: cotizacionJson } = await httpClient(
          `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}`,
          {
            method: "GET",
          }
        );

        setCotizacion(cotizacionJson);

        const solicitudIdDesdeCotizacion =
          cotizacionJson?.idSolicitud ||
          cotizacionJson?.solicitud?.idSolicitud ||
          cotizacionJson?.solicitudId;

        if (solicitudIdDesdeCotizacion) {
          setIdSolicitud(solicitudIdDesdeCotizacion);

          try {
            const { json: solicitudJson } = await httpClient(
              `${apiUrl}/api/solicitudes/${solicitudIdDesdeCotizacion}`,
              {
                method: "GET",
              }
            );

            setSolicitud(solicitudJson);

            if ((!serviciosLS || serviciosLS.length === 0) && solicitudJson?.servicios) {
              setServiciosSeleccionados(solicitudJson.servicios);
            }
          } catch (errorSolicitud) {
            console.warn("No fue posible cargar la solicitud:", errorSolicitud);
          }
        }

        const serviciosDesdeCotizacion =
          cotizacionJson?.serviciosSeleccionados ||
          cotizacionJson?.servicios ||
          cotizacionJson?.detalleServicios;

        if (
          (!serviciosLS || serviciosLS.length === 0) &&
          Array.isArray(serviciosDesdeCotizacion) &&
          serviciosDesdeCotizacion.length > 0
        ) {
          setServiciosSeleccionados(serviciosDesdeCotizacion);
        }
      } catch (errorCotizacion) {
        console.error("Error cargando cotización:", errorCotizacion);
        notify("No fue posible cargar la cotización", { type: "error" });
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      notify("No fue posible cargar los datos iniciales", { type: "error" });
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
  if (idCotizacionPersonalizada) return idCotizacionPersonalizada;

  const payload = {
    idCotizacion: Number(idCotizacion),
    idSolicitud: Number(idSolicitud),
    nombreProyecto: nombreProyecto,
    observacionGeneral: "Adición de actividades personalizadas",
  };

  const { json } = await httpClient(`${apiUrl}/api/cotizaciones-personalizadas`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  const idPersonalizada =
    json?.idCotizacionPersonalizada ||
    json?.id ||
    null;

  if (!idPersonalizada) {
    throw new Error("No se recibió idCotizacionPersonalizada al crear la cabecera");
  }

  setIdCotizacionPersonalizada(idPersonalizada);
  return idPersonalizada;
};

const guardarObraBlanca = async () => {
  if (!serviciosSeleccionados.includes(1)) return;

  const esTipoMetro = (tipoCobro = "") =>
    tipoCobro.toUpperCase().includes("METRO CUADRADO");

  const esTipoUnidad = (tipoCobro = "") =>
    tipoCobro.toUpperCase().includes("UNIDAD") ||
    tipoCobro.toUpperCase().includes("OBJETO");

  const actividadesValidas = obraBlanca.filter(
    (item) =>
      item.idActividad ||
      item.lugar?.trim() ||
      item.cantidad !== "" ||
      item.medida !== "" ||
      item.descripcion?.trim()
  );

  for (const item of actividadesValidas) {
    const actividadSeleccionada = actividadesObraBlanca.find(
      (act) => String(act.idActividad) === String(item.idActividad)
    );

    const payload = {
      idCotizacion: Number(idCotizacion),
      idActividad: item.idActividad ? Number(item.idActividad) : null,
      actividad: actividadSeleccionada?.nombreActividad || "",
      lugar: item.lugar || "",
      unidad: item.tipoCobro || null,
      cantidad: esTipoMetro(item.tipoCobro)
        ? null
        : toNumberOrNull(item.cantidad),
      semanas: null,
      precioUnitario: toNumberOrNull(item.precioUnitario),
      medida: esTipoUnidad(item.tipoCobro)
        ? null
        : toNumberOrNull(item.medida),
      descripcion: item.descripcion || "",
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

const guardarTodosLosFormularios = async () => {
  await guardarObraBlanca();
  await guardarCarpinteria(Number(idCotizacion));
  await guardarVidrio(Number(idCotizacion));
  await guardarMeson(Number(idCotizacion));
};

const recalcularCotizacion = async (idPersonalizada) => {
  await httpClient(
    `${apiUrl}/api/cotizaciones-personalizadas/${idPersonalizada}/recalcular`,
    {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    }
  );
};

const handleGuardarTodo = async () => {
  try {
    setGuardando(true);

    const idPersonalizada = await crearCotizacionSiNoExiste();
    await guardarTodosLosFormularios();
    await recalcularCotizacion(idPersonalizada);

    notify("Formularios guardados correctamente", { type: "success" });
    navigate(`/cotizaciones/${idCotizacion}/vista`);
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

    const idPersonalizada = await crearCotizacionSiNoExiste();
    await guardarTodosLosFormularios();
    await recalcularCotizacion(idPersonalizada);

    notify("Cotización personalizada generada correctamente", {
      type: "success",
    });

    navigate(`/cotizaciones/${idCotizacion}/vista`);
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
      if (id === 1) return "Mano de Obra Blanca";
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
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Cotización N° {cotizacion?.idCotizacion || idCotizacion}
            </Typography>

            <Typography>
              <strong>Proyecto:</strong> {nombreProyecto || "Sin nombre"}
            </Typography>

            <Typography>
              <strong>Servicios seleccionados:</strong> {nombresServicios || "Ninguno"}
            </Typography>
          </Box>

          {serviciosSeleccionados.includes(1) && (
            <FormObraBlanca
              actividadesCatalogo={actividadesObraBlanca}
              value={obraBlanca}
              onChange={setObraBlanca}
            />
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
              onClick={() => navigate(`/cotizaciones/${idCotizacion}/vista`)}
              disabled={guardando}
            >
              Cancelar
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
              {guardando ? "Procesando..." : "COTIZACIÓN PERSONALIZADA"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormulariosCotizacionPersonalizada;