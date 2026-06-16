import axios from 'axios';

const URL_BASE = 'http://localhost:3000/api';

export const obtProductos = async () => {
  try {
    const respuesta = await axios.get(`${URL_BASE}/sabores`);
    return respuesta.data;
  } catch (error) {
    throw new Error('Error al obtener productos');
  }
};

export const insertaProducto = async (producto) => {
  const respuesta = await axios.post(`${URL_BASE}/sabores`, producto);
  return respuesta.data;
};

export const eliminaProducto = async (id) => {
  const respuesta = await axios.delete(`${URL_BASE}/sabores/${id}`);
  return respuesta.data;
};