import api from "./axios";

export const uploadFile = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteFile = async (fileId: string) => {
  const res = await api.delete(`/upload/${fileId}`);
  return res.data;
};

export const getFiles = async () => {
  const res = await api.get("/upload");
  return res.data;
};

export const getFile = async (fileId: string) => {
  const res = await api.get(`/upload/${fileId}`);
  return res.data;
};

export const updateFile = async (fileId: string, data: any) => {
  const res = await api.patch(`/upload/${fileId}`, data);
  return res.data;
};

export const createFile = async (data: any) => {
  const res = await api.post("/upload", data);
  return res.data;
};

export const createFolder = async (data: any) => {
  const res = await api.post("/upload/folder", data);
  return res.data;
};

export const deleteFolder = async (folderId: string) => {
  const res = await api.delete(`/upload/folder/${folderId}`);
  return res.data;
};

export const updateFolder = async (folderId: string, data: any) => {
  const res = await api.patch(`/upload/folder/${folderId}`, data);
  return res.data;
};
