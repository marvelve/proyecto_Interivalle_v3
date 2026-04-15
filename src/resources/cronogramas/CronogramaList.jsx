import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  Button,
  TopToolbar,
  useRedirect,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";

const CronogramaActions = () => {
  return <TopToolbar />;
};

const CronogramaList = () => {
  const redirect = useRedirect();

  return (
    <List
      title="Cronogramas"
      actions={<CronogramaActions />}
      perPage={10}
      sort={{ field: "idCronograma", order: "DESC" }}
    >
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField source="idCronograma" label="ID Cronograma" />
        <TextField source="idCotizacion" label="ID Cotización" />
        <TextField source="nombreProyecto" label="Proyecto" />
        <TextField source="nombreCliente" label="Cliente" />
        <TextField source="estadoCronograma" label="Estado" />
        <DateField source="fechaInicio" label="Fecha inicio" showTime={false} />
        <DateField source="fechaFin" label="Fecha fin" showTime={false} />

        <FunctionField
          label="Avance general"
          render={(record) => `${record?.avanceGeneral || 0}%`}
        />

        <FunctionField
          label="Acciones"
          render={(record) =>
            record?.idCotizacion ? (
              <Button
                label=""
                onClick={() =>
                  redirect(`/cronogramas/cotizacion/${record.idCotizacion}`)
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

export default CronogramaList;