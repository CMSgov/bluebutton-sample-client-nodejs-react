import axios from 'axios';
import FormData from 'form-data';
import logger from '@shared/Logger';

export async function post(endpoint_url: string, data: FormData, headers: any) {
    return await request({ 
        method: 'post',
        url: endpoint_url,
        data: data,
        headers: headers}, true);
}

export async function post_w_config(config: any) {
    return await request(config, false);
}

export async function get(endpointUrl: string, params: any, authToken: string) {
    return await request({ 
        method: 'get',
        url: endpointUrl,
        params: params,
        headers: {
            'Authorization': `Bearer ${authToken}`
        }}, true);
}

export async function request(config: any, retryFlag: boolean) {
    let resp = null
    try {
        resp = await axios(config);
    } catch (error: any) {
        // DEVELOPER NOTES:
        // here handle errors per ErrorResponses.md
        logger.info('Error message: [' + error.message + ']');
        if (error.response) {
            logger.info("response code: " + error.response.status)
            logger.info("response text: " + JSON.stringify(error.response.data))
            // DEVELOPER NOTES:
            // check for retryable (e.g. 500 & fhir) errors and do retrying...
            if (retryFlag && isRetryable(error)) {
                logger.info("Request failed and is retryable, entering retry process...")
                var retryResp = await do_retry(config)
                if (retryResp) {
                    resp = retryResp;
                }
            }
            else {
                resp = error.response
            }
        }
        else if (error.request) {
            // something went wrong on sender side, not retryable
            // error.request is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            logger.info("error.request: " + error.request);
        }
    }
    return resp    
}

function isRetryable(error: any) {
    if (error.response && error.response.status === 500) {
        if (error.request.path && error.request.path.match("^/v[12]/fhir/.*")) {
            return true;
        }
    }
    return false;
}

// for demo: retry init-interval = 5 sec, max attempt 3, with retry interval = init-interval * (2 ** n)
// where n retry attempted
async function do_retry(config: any) {
    const interval = 5
    const max_attempts = 3
    var resp = null
    for (let i = 0; i < max_attempts; i++) {
        var wait_in_sec = interval * (2 ** i)
        logger.info("wait " + wait_in_sec + " seconds...")
        await sleep(wait_in_sec * 1000)
        logger.info("retry attempts: " + (i+1))
        try {
            resp = await axios(config);
            logger.info("retry successful:")
            logger.info(resp.data);
            break;
        } catch (error: any) {
            logger.info("retry error: [" + JSON.stringify(error.message) + "]")
            if (error.response) {
                logger.info("response code: " + error.response.status)
                logger.info("response data: " + error.response.data)
                resp = error.response
            }
        }
    }
    return resp
}

function sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
}
  