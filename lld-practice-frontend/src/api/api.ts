import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const submitAttempt = async (problemId: string, content: string) => {
  const response = await axios.post(`${API_BASE}/attempts`, {
    problemId,
    format: 'TEXT',
    content,
  });
  return response.data;
};

export const getAttemptStatus = async (attemptId: string) => {
  const response = await axios.get(`${API_BASE}/attempts/${attemptId}`);
  return response.data;
};

export const getProblems = async () => {
  const response = await axios.get(`${API_BASE}/problems`);
  return response.data;
};

export const getProblemAttempts = async (problemId: string) => {
  const response = await axios.get(`${API_BASE}/attempts/problem/${problemId}`);
  return response.data;
};