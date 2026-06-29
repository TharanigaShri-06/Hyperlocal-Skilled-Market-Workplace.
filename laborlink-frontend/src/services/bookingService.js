import axios from "axios";

const BASE_URL = "http://localhost:8080/bookings";

export const createBooking = async (bookingData) => {
  const response = await axios.post(BASE_URL, bookingData);
  return response.data;
};

export const getWorkerBookings = async (workerId) => {
  const response = await axios.get(`${BASE_URL}/worker/${workerId}`);
  return response.data;
};

export const getAllBookings = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const acceptBooking = async (bookingId) => {
  const response = await axios.put(`${BASE_URL}/${bookingId}/accept`);
  return response.data;
};

export const rejectBooking = async (bookingId) => {
  const response = await axios.put(`${BASE_URL}/${bookingId}/reject`);
  return response.data;
};

export const getBookingsByCustomer = async (userId) => {
  const response = await axios.get(`${BASE_URL}/customer/${userId}`);
  return response.data;
};

export const rateBooking = async (bookingId, rating) => {
  const response = await axios.put(`${BASE_URL}/${bookingId}/rate`, null, {
    params: { rating }
  });
  return response.data;
};
