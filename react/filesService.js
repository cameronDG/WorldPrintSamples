import axios from "axios";
import {
  API_HOST_PREFIX,
  onGlobalError,
  onGlobalSuccess,
} from "./serviceHelpers";

let filesEndpoint = `${API_HOST_PREFIX}/api/files`;

const post = (payload) => {
  const config = {
    method: "POST",
    url: filesEndpoint + "/upload",
    data: payload,
    withCredentials: true,
    crossdomain: true,
    headers: { "Content-Type": "multipart/form-data" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export { post };
