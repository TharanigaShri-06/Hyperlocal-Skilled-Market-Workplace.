import axios from "axios";

const BASE_URL = "http://localhost:8080/users";

export const loginUser = async (loginData) => {
  const response = await axios.post(
    `${BASE_URL}/login`,
    loginData
  );

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(
    BASE_URL,
    userData
  );

  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(
    BASE_URL
  );

  return response.data;
};

export const checkEmailExists = async (email) => {
  const response = await axios.get(`${BASE_URL}/check-email`, {
    params: { email }
  });
  return response.data;
};

export const getSecurityQuestion = async (email) => {
  const response = await axios.get(`${BASE_URL}/security-question`, {
    params: { email }
  });
  return response.data;
};

export const resetPassword = async (resetData) => {
  const response = await axios.post(`${BASE_URL}/reset-password`, resetData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${BASE_URL}/${userId}`);
  return response.data;
};

// SuperAdmin operations
export const createAdmin = async (adminData) => {
  const response = await axios.post("http://localhost:8080/admin/create-admin", adminData);
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await axios.put(`http://localhost:8080/admin/admins/${id}`, adminData);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await axios.delete(`http://localhost:8080/admin/admins/${id}`);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await axios.get("http://localhost:8080/admin/admin-stats");
  return response.data;
};

// Admin delegated user operations
export const registerUserByAdmin = async (userData, adminEmail) => {
  const response = await axios.post("http://localhost:8080/admin/register-user", userData, {
    params: { adminEmail }
  });
  return response.data;
};

export const getUsersByAdmin = async (adminEmail) => {
  const response = await axios.get("http://localhost:8080/admin/my-users", {
    params: { adminEmail }
  });
  return response.data;
};

export const updateUserByAdmin = async (id, userData, adminEmail) => {
  const response = await axios.put(`http://localhost:8080/admin/users/${id}`, userData, {
    params: { adminEmail }
  });
  return response.data;
};

export const deleteUserByAdmin = async (id, adminEmail) => {
  const response = await axios.delete(`http://localhost:8080/admin/users/${id}`, {
    params: { adminEmail }
  });
  return response.data;
};