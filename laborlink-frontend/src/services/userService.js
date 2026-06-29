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