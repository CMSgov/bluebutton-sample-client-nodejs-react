import axios from 'axios';
import FormData from 'form-data';
import { try_later } from './queue';
import { is_retryable } from './retry';

export async function endpointPost(endpoint_url: string, data: FormData, extra: any) {
    return await httpCall({ 
        method: 'post',
        url: endpoint_url,
        data: data,
        headers: extra}, true);
}

export async function endpointGet(endpoint_url: string, req_qry: any, token: string) {
    return await httpCall({ 
        method: 'get',
        url: endpoint_url,
        params: req_qry,
        headers: {
            'Authorization': `Bearer ${token}`
        }}, true);
}

export async function httpCall(config: any, retry_flag: boolean) {
    var resp = null
    try {
        resp = await axios(config);
        console.log("<<<<<<<<<<<<<<<<<<< RESPONSE:")
        console.log(resp.data);
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    } catch (error: any) {
        // DEVELOPER NOTES:
        // here handle errors per errors.readme.md
        if (error.response) {
            console.log("<<<<<<<<<<<<<<<<<<<<<< ERROR RESPONSE:")
            console.log(error.response.status)
            console.log(error.response.data)
            resp = error.response
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>")
            // DEVELOPER NOTES:
            // check for retryable (500) errors and enqueue it for retry
            if (retry_flag && is_retryable(error)) {
                try_later(error);
                console.log("Request failed and is retryable, saved for retry later.")
            }
        }
        else if (error.request) {
            // something went wrong on sender side, not retryable
            // error.request is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("<<<<<<<<<<<<<<<<<<<<<< ERROR REQUEST:")
            console.log(error.request);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>")
        }
        else {
            console.log("<<<<<<<<<<<<<<<<<<<<<<<< OTHER ERRORS:")
            console.log('Error: [', error.message, ']');
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>")
        }
        // dump axios config for diagnosis
        console.log("----------------- CONFIG:")
        console.log(error.config);
        console.log("-------------------------")
    }
    return resp    
}