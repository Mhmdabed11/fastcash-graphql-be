import axios from "axios";

export const request = baseURL => {
  const apiClient = axios.create({
    baseURL
  });
  //return api response data
  const onRequestSuccess = response => response.data;

  return {
    get: (url, params) =>
      apiClient({
        method: "get",
        url,
        params
      }).then(onRequestSuccess)
  };
};
