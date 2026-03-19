import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";

import authProvider from "./authProvider";
import dataProvider from "./dataProvider";

import Dashboard from "../components/Dashboard";
import CustomMenu from "../components/CustomMenu";

import LoginPage from "../pages/LoginPage";
import Register from "../pages/Register";
import CotizacionBase from "../pages/CotizacionBase";
import CotizacionPersonalizadaDetalle from "../pages/CotizacionPersonalizadaDetalle";
import FormulariosCotizacionPersonalizada from "../pages/FormulariosCotizacionPersonalizada";

import UsuarioList from "../resources/usuarios/UsuarioList";
import UsuarioEdit from "../resources/usuarios/UsuarioEdit";
import UsuarioCreate from "../resources/usuarios/UsuarioCreate";

import SolicitudList from "../resources/solicitudes/SolicitudList";
import SolicitudCreate from "../resources/solicitudes/SolicitudCreate";
import SolicitudShow from "../resources/solicitudes/SolicitudShow";

import CotizacionList from "../resources/cotizaciones/CotizacionList";
import CotizacionShow from "../resources/cotizaciones/CotizacionShow";
import CotizacionVista from "../resources/cotizaciones/CotizacionVista";

import CronogramaList from "../resources/cronogramas/CronogramaList";
import CronogramaCreate from "../resources/cronogramas/CronogramaCreate";
import CronogramaEdit from "../resources/cronogramas/CronogramaEdit";

import AvanceList from "../resources/avances/AvanceList";
import AvanceCreate from "../resources/avances/AvanceCreate";
import AvanceShow from "../resources/avances/AvanceShow";

const App = () => {
  return (
    <Admin
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
      menu={CustomMenu}
      loginPage={LoginPage}
    >
      <CustomRoutes noLayout>
        <Route path="/register" element={<Register />} />
      </CustomRoutes>
       <CustomRoutes>
        <Route path="/cotizacion-base" element={<CotizacionBase />} />
      </CustomRoutes>
      <CustomRoutes>
      <Route path="/cotizaciones/:idCotizacion/vista" element={<CotizacionVista />} />
      <Route path="/cotizacion-personalizada/formularios/:idSolicitud"
      element={<FormulariosCotizacionPersonalizada />}   />
      <Route
      path="/cotizaciones-personalizadas/:idCotizacion/detalle"
        element={<CotizacionPersonalizadaDetalle />} />
    </CustomRoutes>

      {(permissions) => [
        permissions === "1" ? (
          <Resource
            key="usuarios"
            name="admin/usuarios"
            options={{ label: "Usuarios" }}
            list={UsuarioList}
            edit={UsuarioEdit}
            create={UsuarioCreate}
          />
        ) : null,

        permissions === "1" || permissions === "3" ? (
          <Resource
            key="solicitudes"
            name="solicitudes"
            options={{ label: "Solicitudes" }}
            list={SolicitudList}
            create={SolicitudCreate}
            show={SolicitudShow}
          />
        ) : null,

        permissions === "1" || permissions === "3" ? (
          <Resource
            key="cotizaciones"
            name="cotizaciones"
            options={{ label: "Cotizaciones" }}
            list={CotizacionList}
            show={CotizacionVista}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="cronogramas"
            name="cronogramas"
            options={{ label: "Cronogramas" }}
            list={CronogramaList}
            create={permissions === "1" || permissions === "2" ? CronogramaCreate : undefined}
            edit={permissions === "1" || permissions === "2" ? CronogramaEdit : undefined}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="avances"
            name="avances"
            options={{ label: "Avances" }}
            list={AvanceList}
            create={AvanceCreate}
            show={AvanceShow}
          />
        ) : null,
      ]}
    </Admin>
  );
};

export default App;