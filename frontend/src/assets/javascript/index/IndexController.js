export class IndexController {
  #count = 0;

  incrementCount() {
        this.#count++;
        return this.#count;
    }

    get totalCount() {
        return this.#count;
    }

    resetCount() {
        this.#count = 0;
        return this.#count;
    }
}
