import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { updateUserById, deleteUserById } from "../services/user.service.js";

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "¡Hola! Este es un perfil público. Cualquiera puede verlo.",
  });
}

export function getPrivateProfile(req, res) {
  const user = req.user;

  handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
    message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
    userData: user,
  });
}

export async function updatePrivateProfile(req, res) {
  try {
    const userId = req.user?.sub;
    const changes = req.body;

    if (!userId) return handleErrorClient(res, 401, "No autenticado");
    if (!changes || Object.keys(changes).length === 0) {
      return handleErrorClient(res, 400, "Datos para actualizar son requeridos");
    }

    // Solo permitir email y password
    const allowed = {};
    if (typeof changes.email !== "undefined") allowed.email = changes.email;
    if (typeof changes.password !== "undefined") allowed.password = changes.password;

    const updated = await updateUserById(userId, allowed);
    handleSuccess(res, 200, "Perfil actualizado exitosamente", updated);
  } catch (error) {
    if (error.code === '23505') {
      return handleErrorClient(res, 409, "El email ya está registrado");
    }
    handleErrorServer(res, 500, "Error al actualizar el perfil", error.message);
  }
}

export async function deletePrivateProfile(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return handleErrorClient(res, 401, "No autenticado");

    const result = await deleteUserById(userId);
    handleSuccess(res, 200, "Perfil eliminado exitosamente", result);
  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar el perfil", error.message);
  }
}
