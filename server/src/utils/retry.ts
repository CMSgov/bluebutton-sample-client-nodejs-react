import * as cron from 'node-cron'
import { do_retry } from './queue';
import logger from '@shared/Logger';

// schedule cron job
export function schedule() {
    cron.schedule('30 * * * * *', do_retry);
}

export function is_retryable(error: any) {
    if (error.response && error.response.status === 500) {
        if (error.request.path && error.request.path.match("^/v[12]/fhir/.*")) {
            return true;
        }
    }
    return false;
}

export default class Retryable {
    // for now, a trivial wrapper of error captured from axios call
    // instance of axios.AxiosError?
    // later, other attributes e.g. retry policy could be tied with a retryable
    public error: any;
    // positive integer, retry attempts so far
    public count: number;
    // positive integer, max retry attempts allowed
    public max: number;
    // timestamp created
    public created: Date;

    constructor(err: any, max: number) {
        this.error = err;
        this.count = 1;
        this.max = max;
        this.created = new Date();
    }

    ready() {
        var is_ready = false;
        if (!this.expired()) {
            // hard code back off by minutes
            var next_retry_time = new Date(this.created.getTime() + (60000 * (2 ** this.count)))
            var current_time = new Date()
            is_ready = current_time > next_retry_time;
        }
        return is_ready;
    }

    tried() {
        this.count=this.count + 1;
        return !this.expired();
    }

    expired() {
        return (this.max - this.count) === 0;
    }
}

