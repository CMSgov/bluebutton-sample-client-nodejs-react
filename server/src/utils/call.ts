import axios from 'axios';
import FormData from 'form-data';
import { try_later } from './queue';
import { is_retryable } from './retry';
import logger from '@shared/Logger';

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
        logger.info("RESPONSE:")
        logger.info(resp.data);
    } catch (error: any) {
        // DEVELOPER NOTES:
        // here handle errors per errors.readme.md
        if (error.response) {
            logger.info("ERROR RESPONSE:")
            logger.info(error.response.status)
            logger.info(error.response.data)
            resp = error.response
            // DEVELOPER NOTES:
            // check for retryable (500) errors and enqueue it for retry
            if (retry_flag && is_retryable(error)) {
                try_later(error);
                logger.info("Request failed and is retryable, saved for retry later.")
            }
        }
        else if (error.request) {
            // something went wrong on sender side, not retryable
            // error.request is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            logger.info("ERROR REQUEST:")
            logger.info(error.request);
        }
        else {
            logger.info("OTHER ERRORS:")
            logger.info('Error: [' + error.message + ']');
        }
        // dump axios config for diagnosis
        logger.info("CONFIG:")
        logger.info(error.config);
    }
    return resp    
}