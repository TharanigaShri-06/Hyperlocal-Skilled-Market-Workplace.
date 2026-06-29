import axios from "axios";

const BASE_URL = "http://localhost:8080/workers";

export const getAllWorkers = async () => {
const response = await axios.get(BASE_URL);
return response.data;
};

export const getWorkerByUserId = async (
userId
) => {

const response = await axios.get(
`${BASE_URL}/user/${userId}`
);

return response.data;
};
export const createWorker = async (workerData) => {

const response = await axios.post(
BASE_URL,
workerData
);

return response.data;

};

export const updateAvailability = async (workerId, availability) => {
  const response = await axios.put(`${BASE_URL}/${workerId}/availability`, null, {
    params: { availability }
  });
  return response.data;
};
