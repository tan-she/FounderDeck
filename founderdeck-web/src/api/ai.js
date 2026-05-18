import api from "./axios";

export const generateOneLiner = (data) =>
  api.post("/ai/generate-oneliner", data, { timeout: 50000 }).then((r) => r.data);

export const enhanceDescription = (data) =>
  api.post("/ai/enhance-description", data, { timeout: 100000 }).then((r) => r.data);
