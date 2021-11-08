import Retryable from './retry';
import { httpCall } from './call';

interface IQueue<T> {
    enQ(item: T): void;
    deQ(): T | undefined;
    size(): number;
}

export default class Retryables<T> implements IQueue<T> {
    private storage: T[] = [];
  
    constructor(private max: number = Infinity) {}
  
    enQ(item: T): void {
      if (this.size() === this.max) {
        throw Error("Max capacity reached, enQ rejected.");
      }
      this.storage.push(item);
    }

    deQ(): T | undefined {
      return this.storage.shift();
    }

    size(): number {
      return this.storage.length;
    }
}

const RetryableRequests = new Retryables<Retryable>();

export function try_later(item: any) {
    console.log("try_later() called: ", item)
    RetryableRequests.enQ(new Retryable(item, 3));
}

export async function do_retry() {
    var size = RetryableRequests.size();
    console.log('Checking ..., # of requests to be retried: ', size);
    for (let i = 0; i < size; i++) {
        let r: Retryable = RetryableRequests.deQ()!
        if (r.ready()) {
            const resp = await httpCall(r.error.config, false);
            if (resp && resp.status === 200) {
                // TODO: persist fhir resource into local storage
                console.log("RETRY SUCCESSFUL.....");
                // break out - one retry per scan
                break;
            }
            else if (r.tried()) {
                // max not reached yet (not expired)
                RetryableRequests.enQ(r);
            }
        }
        else {
            RetryableRequests.enQ(r);
        }
    }
}
