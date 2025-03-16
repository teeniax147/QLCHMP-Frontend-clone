import axios from 'axios';

// URL gốc cho API, thêm /api nếu dùng proxy ở trên
const API_URL = '/api'; 

export const fetchData = async () => {
    try {
        const response = await axios.get(`${API_URL}/your-endpoint`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const postData = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/your-endpoint`, data);
        return response.data;
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
};
