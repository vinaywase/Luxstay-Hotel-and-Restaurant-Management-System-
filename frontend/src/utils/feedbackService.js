// src/services/feedbackService.js
import axios from "axios";

const BASE = "/api/feedbacks";

const feedbackService = {
    /** Admin + Staff: all feedbacks */
    getAll: () => axios.get(BASE).then((r) => r.data),

    /** Get by ID */
    getById: (id) => axios.get(`${BASE}/${id}`).then((r) => r.data),

    /** Guest: my feedbacks */
    getByCustomer: (customerId) =>
        axios.get(`${BASE}/customer/${customerId}`).then((r) => r.data),

    /** Filter by service type */
    getByServiceType: (type) =>
        axios.get(`${BASE}/type/${type}`).then((r) => r.data),

    /** Create */
    create: (dto) => axios.post(BASE, dto).then((r) => r.data),

    /** Update */
    update: (id, dto) => axios.put(`${BASE}/${id}`, dto).then((r) => r.data),

    /** Delete */
    delete: (id) => axios.delete(`${BASE}/${id}`),
};

export default feedbackService;