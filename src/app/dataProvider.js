import simpleRestProvider from "ra-data-simple-rest";
import httpClient, { apiUrl } from "../app/httpClient";

const baseDataProvider = simpleRestProvider(`${apiUrl}/api`, httpClient);

const mapIdField = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      id:
        item.id ??
        item.idUsuario ??
        item.idSolicitud ??
        item.idCotizacion ??
        item.idCronograma ??
        item.idAvance,
    }));
    
  }

  return {
    ...data,
    id:
      data.id ??
      data.idUsuario ??
      data.idSolicitud ??
      data.idCotizacion ??
      data.idCronograma ??
      data.idAvance,
  };
};

const dataProvider = {
  ...baseDataProvider,

getList: async (resource, params) => {
  if (resource === "solicitudes") {
    const correoUsuario = params.filter?.correoUsuario || "";

    const url = `${apiUrl}/api/solicitudes${
      correoUsuario
        ? `?correoUsuario=${encodeURIComponent(correoUsuario)}`
        : ""
    }`;

    const { json } = await httpClient(url);

    return {
      data: mapIdField(json),
      total: Array.isArray(json) ? json.length : 0,
    };
  }

  if (resource === "cotizaciones") {
    const { json } = await httpClient(`${apiUrl}/api/cliente/cotizaciones`);

    return {
      data: mapIdField(json),
      total: Array.isArray(json) ? json.length : 0,
    };
  }

   if (resource === "cronogramas") {
      const { json } = await httpClient(`${apiUrl}/api/cliente/cronogramas`);

      return {
        data: mapIdField(json),
        total: Array.isArray(json) ? json.length : 0,
      };
    }

  const response = await baseDataProvider.getList(resource, params);
  return {
    ...response,
    data: mapIdField(response.data),
  };
},
  
getOne: async (resource, params) => {
  if (resource === "cotizaciones") {
    const { json } = await httpClient(
      `${apiUrl}/api/cliente/cotizaciones/${params.id}`
    );

    return {
      data: mapIdField(json),
    };
  }

  const response = await baseDataProvider.getOne(resource, params);
  return {
    ...response,
    data: mapIdField(response.data),
  };
},

  getMany: async (resource, params) => {
    const response = await baseDataProvider.getMany(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },

  getManyReference: async (resource, params) => {
    const response = await baseDataProvider.getManyReference(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },

  create: async (resource, params) => {
    const response = await baseDataProvider.create(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },

  update: async (resource, params) => {
    const response = await baseDataProvider.update(resource, params);
    return {
      ...response,
      data: mapIdField(response.data),
    };
  },
};

export default dataProvider;