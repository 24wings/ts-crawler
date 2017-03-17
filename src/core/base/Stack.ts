/**
 * 基本栈的数据结构
 */
export class Stack<T> {
    private items = [];
    push(element: T) {
        this.items.push(element);
    }
    pop(element: T) {
        return this.items.pop();
    }
    /**
     * 只返回最后一个元素
     */
    peek() {
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    clear() {
        this.items = [];
    }
}


