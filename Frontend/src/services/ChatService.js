// Frontend/src/services/ChatService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api';

class ChatService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000, // 30 seconds timeout for AI responses
        });

        // Add request interceptor to include auth token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    /**
     * Send message to the legal assistant API
     * @param {Array} messages - Array of message objects with role and content
     * @returns {Promise} - Promise with the response
     */
    async sendMessage(messages) {
        try {
            const response = await this.axiosInstance.post('/legal-assistant/chat', { messages });
            return response.data;
        } catch (error) {
            // If the main API fails, try the fallback
            if (error.response && (error.response.status === 500 || error.response.status === 503)) {
                return this.sendFallbackMessage(messages[messages.length - 1].content);
            }
            throw error;
        }
    }

    /**
     * Send message to the fallback simple chat API
     * @param {string} query - The user's question
     * @returns {Promise} - Promise with the response
     */
    async sendFallbackMessage(query) {
        try {
            const response = await this.axiosInstance.post('/legal-assistant/simple-chat', { query });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if the legal assistant service is available
     * @returns {Promise<boolean>} - Promise resolving to true if available
     */
    async checkServiceStatus() {
        try {
            const response = await this.axiosInstance.get('/legal-assistant/status', { timeout: 5000 });
            return response.data.available === true;
        } catch (error) {
            return false;
        }
    }
}

// Create a singleton instance
const chatService = new ChatService();
export default chatService;