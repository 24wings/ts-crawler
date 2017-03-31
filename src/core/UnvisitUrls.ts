import { Queue } from './base/Queue';
export class UnVisitUrls<T> {
    private queue: Queue<T> = new Queue<T>();


    dequeue() {
        return this.queue.dequeue();
    }

    has(url): boolean {
        return this.queue.has(url);
    }
    // 若队列中已经有该元素,则不会入列
    enqueue(url: T) {
        console.log(this.has(url));
        if (!this.has(url)) {
            console.log('入列' + url);
            this.queue.enqueue(url);
        }
    }
    enqueueFirst(url: T) {
        console.log(this.has(url));
        if (!this.has(url)) {
            console.log('入列到头部' + url);
            this.queue.enqueueFirst(url);
        }
    }

    hasNext(): boolean {
        return !this.queue.isEmpty();
    }
    size(): number {
        return this.queue.size();
    }
}