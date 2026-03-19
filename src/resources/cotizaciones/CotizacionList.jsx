import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  ShowButton,
} from "react-admin";

const CotizacionList = () => {
  return (
    <List title="Cotizaciones">
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="idCotizacion" label="N° Cotización" />
        <TextField source="solicitudId" label="N° Solicitud" />
        <TextField source="nombreProyecto" label="Nombre Proyecto" />
        <TextField source="estado" label="Estado" />
        <ShowButton />
      </Datagrid>
    </List>
  );
};

export default CotizacionList;