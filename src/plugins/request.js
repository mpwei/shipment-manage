import axios from 'axios'

export const ServerRequest = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? 'https://asia-east1-mpwei-logistics-system.cloudfunctions.net' : 'http://localhost:8080/api'
})

ServerRequest.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        let Error
        if (error.response) {
            Error = {
                ...error.response.data,
                Status: error.response.status,
                Header: error.response.headers
            }
        } else if (error.request) {
            Error = {
                Code: 'L-XXX',
                Message: 'No receive any response and error.',
                Status: 500
            }
        } else {
            Error = {
                Code: 'L-XXT',
                Message: error.message,
                Status: 501
            }
        }
        return Promise.reject(Error)
    }
)
