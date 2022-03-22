import axios from 'axios';
import FormData from 'form-data';
import logger from '../shared/Logger';

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function isRetryable(error: any) {
  if (error.response && error.response.status === 500) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
    if (error.request.path && error.request.path.match('^/v[12]/fhir/.*')) {
      return true;
    }
  }
  return false;
}

// for demo: retry init-interval = 5 sec, max attempt 3,
// with retry interval = init-interval * (2 ** n)
// where n retry attempted
async function doRetry(config: any) {
  const interval = 5;
  const maxAttempts = 3;
  let resp = null;
  // retry order is important, need 'await' here - disable in loop and re-enable after loop
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < maxAttempts; i += 1) {
    const waitInSec = interval * (2 ** i);
    logger.info(`wait ${waitInSec} seconds...`);
    await sleep(waitInSec * 1000);
    logger.info(`retry attempts: ${i + 1}`);
    try {
      resp = await axios(config);
      logger.info('retry successful:');
      logger.info(resp.data);
      break;
    } catch (error: any) {
      logger.info(`retry error: [${JSON.stringify(error.message)}]`);
      if (error.response) {
        logger.info(`response code: ${String(error.response.status)}`);
        logger.info(`response data: ${JSON.stringify(error.response.data)}`);
        resp = error.response;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
  return resp;
}

export async function request(config: any, retryFlag: boolean) {
  let resp = null;
  try {
    resp = await axios(config);
  } catch (error: any) {
    // DEVELOPER NOTES:
    // here handle errors per ErrorResponses.md
    logger.info(`Error message: [${JSON.stringify(error.message)}]`);
    if (error.response) {
      logger.info(`response code: ${String(error.response?.status)}`);
      logger.info(`response text: ${JSON.stringify(error.response.data)}`);
      // DEVELOPER NOTES:
      // check for retryable (e.g. 500 & fhir) errors and do retrying...
      if (retryFlag && isRetryable(error)) {
        logger.info('Request failed and is retryable, entering retry process...');
        const retryResp = await doRetry(config);
        if (retryResp) {
          resp = retryResp;
        }
      } else {
        resp = error.response;
      }
    } else if (error.request) {
      // something went wrong on sender side, not retryable
      // error.request is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logger.info(`error.request: ${String(error.request)}`);
    }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
  return resp;
}

export async function post(endpoint_url: string, data: FormData, headers: any) {
  return request({
    method: 'post',
    url: endpoint_url,
    data,
    headers,
  }, true);
}

export async function postWithConfig(config: any) {
  return request(config, false);
}

export async function get(endpointUrl: string, params: any, authToken: string) {
  return request({
    method: 'get',
    url: endpointUrl,
    params,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }, true);
}
