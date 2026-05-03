import axios from "axios";

const API_URL = "https://socialfly-web-app2-production.up.railway.app" ;
console.log("API_URL =", API_URL);
const API = `${API_URL}/api/auth`;

const login = async (data) => {
  const res = await axios.post(`${API}/login`, data,{
    withCredentials: true, 
  });
  return res.data;
};
const signup = (data) => axios.post(`${API}/signup`, data,{
    withCredentials: true, 
  });

export default { login , signup};