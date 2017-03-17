export class Queue<T> {
    private items = [];
    enqueue(item: T) {
        this.items.push(item);
    }
    dequeue(): T {
        return this.items.shift();
    }
    front() {
        return this.items[0];
    }
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    clear() {
        this.items = [];
    }
    size(): number {
        return this.items.length;
    }
    has(item: T): boolean {
        return this.items.findIndex(el => item == el) !== -1 ? true : false;
    }
}