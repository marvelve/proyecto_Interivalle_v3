import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  TopToolbar,
  Button,
  useRedirect,
  useNotify,
  useRefresh
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import { Chip } from "@mui/material";

import httpClient, { apiUrl } from "../../app/httpClient";
import SolicitudVacia from "./SolicitudVacia";


/* ===============================
   BOTÓN CREAR COTIZACIÓN
================================= */

const CrearCotizacionButton = ({ record }) => {

  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();

  const handleClick = async () => {

    try {

      await httpClient(`${apiUrl}/api/solicitudes/${record.idSolicitud}/generar`, {
        method: "PUT"
      });

      notify("Cotización generada correctamente", { type: "success" });

      refresh();

      redirect("/cotizacion-base");

    } catch (error) {

      console.error(error);

      notify(
        error?.body?.message || "Error al generar la cotización",
        { type: "error" }
      );
    }
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleClick}
      sx={{
        backgroundColor: "#0aa000",
        "&:hover": { backgroundColor: "#088500" }
      }}
    >
      Crear Cotización
    </Button>
  );
};


/* ===============================
   BOTÓN CREAR NUEVA SOLICITUD
================================= */

const SolicitudesActions = () => {

  const redirect = useRedirect();

  return (
    <TopToolbar>
      <Button
        label=" Crear Solicitud"
        onClick={() => redirect("/solicitudes/create")}
      >
        <AddIcon />
      </Button>
    </TopToolbar>
  );
};


/* ===============================
   COMPONENTE PRINCIPAL
================================= */

const SolicitudList = () => {

  const correoUsuario = localStorage.getItem("correoUsuario") || "";
  const idRol = localStorage.getItem("idRol") || "";

  const esAdmin = String(idRol) === "1";

  const redirect = useRedirect();

  const handleReprogramar = (record) => {
    redirect(`/solicitudes/${record.idSolicitud}/reprogramar`);
  };

  return (
    <List
      title="Listado de Solicitudes"
      resource="solicitudes"
      actions={<SolicitudesActions />}
      empty={<SolicitudVacia />}
      filter={esAdmin ? {} : { correoUsuario }}
      sort={{ field: "idSolicitud", order: "DESC" }}
      perPage={10}
    >

      <Datagrid rowClick={false} bulkActionButtons={false}>

        <TextField source="idSolicitud" label="ID" />

        <TextField source="correoUsuario" label="Correo Usuario" />

        <TextField source="tipoSolicitud" label="Tipo Solicitud" />

        <TextField source="nombreProyecto" label="Proyecto" />

        {/* ESTADO CON COLOR */}

        <FunctionField
          label="Estado"
          render={(record) => {

            if (record.estado === "PENDIENTE") {
              return <Chip label="PENDIENTE" color="warning" />;
            }

            if (record.estado === "GENERADA") {
              return <Chip label="GENERADA" color="success" />;
            }

            if (record.estado === "BORRADOR") {
              return <Chip label="BORRADOR" color="info" />;
            }

            return record.estado;
          }}
        />

        <DateField source="fechaSolicitud" label="Fecha" />

        <FunctionField
          label="Fecha/Hora Visita"
          render={(record) => {
            if (record?.tipoSolicitud !== "VISITA_TECNICA") return "-";

            const fecha = record?.fechaVisita || "-";
            const hora = record?.horaVisita || "-";

            return `${fecha} - ${hora}`;
          }}
        />

        {/* SERVICIOS */}

        <FunctionField
          label="Servicios"
          render={(record) => {

            if (!record?.solicitudServicios || record.solicitudServicios.length === 0) {
              return "Sin servicios";
            }

            return record.solicitudServicios
              .map((servicio) => servicio.nombreServicio)
              .join(", ");
          }}
        />

        {/* ACCIONES */}

        <FunctionField
          label="Acciones"
          render={(record) => {
            if (
              record?.tipoSolicitud === "COTIZACION_BASE" &&
              (record?.estado === "PENDIENTE" || record?.estado === "REPROGRAMADA")
            ) {
              return (
                <CrearCotizacionButton record={record} />
              );
            }

            if (record?.tipoSolicitud === "VISITA_TECNICA") {
              return (
                <Button
                  label="REPROGRAMAR"
                  onClick={() => handleReprogramar(record)}
                  sx={{
                      backgroundColor: "#14a800",
                      color: "#fff",
                      px: 2,
                      borderRadius: 1,
                      "&:hover": { backgroundColor: "#118a00" }
                    }}
                />
              );
            }

            return <span>-</span>;
          }}
        />

      </Datagrid>

    </List>
  );
};

export default SolicitudList;