import axios from 'axios';
import FormData from 'form-data';
import logger from '@shared/Logger';

export async function post(endpoint_url: string, data: FormData, extra: any) {
    return await request({ 
        method: 'post',
        url: endpoint_url,
        data: data,
        headers: extra}, true);
}

export async function get(endpoint_url: string, req_qry: any, token: string) {
    return await request({ 
        method: 'get',
        url: endpoint_url,
        params: req_qry,
        headers: {
            'Authorization': `Bearer ${token}`
        }}, true);
}

export async function request(config: any, retry_flag: boolean) {
    var resp = null
    try {
        resp = await axios(config);
    } catch (error: any) {
        // DEVELOPER NOTES:
        // here handle errors per errors.md
        console.log('Error message: [', error.message, ']');
        if (error.response) {
            console.log("response code: " + error.response.status)
            console.log("response text: " + error.response.data)
            // DEVELOPER NOTES:
            // check for retryable (e.g. 500 & fhir) errors and do retrying...
            if (retry_flag && is_retryable(error)) {
                console.log("Request failed and is retryable, entering retry process...")
                var retry_resp = await do_retry(config)
                if (retry_resp) {
                    resp = retry_resp;
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
            console.log("error.request: " + error.request);
        }
        // dump axios config for diagnosis
        console.log("config:")
        console.log(error.config);
    }
    return resp    
}

function is_retryable(error: any) {
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
        console.log("wait ", wait_in_sec, " seconds...")
        await sleep(wait_in_sec * 1000)
        console.log("retry attempts: ", i+1)
        try {
            resp = await axios(config);
            console.log("retry successful:")
            console.log(resp.data);
            break;
        } catch (error: any) {
            console.log("retry error: [", error.message, "]")
            if (error.response) {
                console.log("response code: ", error.response.status)
                console.log("response data: ", error.response.data)
            }
        }
    }
    return resp
}

function sleep(ms: any) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
  