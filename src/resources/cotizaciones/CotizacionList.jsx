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
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CotizacionVacia from "./CotizacionVacia";

const CotizacionActions = () => {
  const redirect = useRedirect();

  return (
    <TopToolbar>
      <Button
        label="Crear solicitud"
        onClick={() => redirect("/solicitudes/nueva")}
      >
        <AddIcon />
      </Button>
    </TopToolbar>
  );
};

const CotizacionList = () => {
  const redirect = useRedirect();

  return (
    <List
      title="Cotizaciones"
      actions={<CotizacionActions />}
      empty={<CotizacionVacia />}
      perPage={10}
      sort={{ field: "idCotizacion", order: "DESC" }}
    >
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField source="idCotizacion" label="ID" />
        <TextField source="nombreProyecto" label="Proyecto" />
        <TextField source="tipoCotizacion" label="Tipo" />
        <TextField source="estado" label="Estado" />
        <DateField source="fechaCreacion" label="Fecha" showTime={false} />

     <FunctionField
      label="Ver"
      render={(record) =>
        record?.idCotizacion ? (
          <Button
            label=""
            onClick={() =>
              redirect(`/cotizaciones/${record.idCotizacion}/vista`)
            }
          >
            <VisibilityIcon />
          </Button>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        )
      }
    />
      </Datagrid>
    </List>
  );
};

export default CotizacionList;