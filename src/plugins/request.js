import axios from 'axios'

export const FunctionServerRequest = axios.create({
    // baseURL: process.env.NODE_ENV === 'production' ? 'https://asia-east1-mpwei-logistics-system.cloudfunctions.net' : 'http://localhost:8080/function'
    baseURL: '/function'
})

FunctionServerRequest.interceptors.response.use(
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

export const InnerServerRequest = axios.create({
    baseURL: '/api',
    timeout: 60000
})

InnerServerRequest.interceptors.response.use(
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
