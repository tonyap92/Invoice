class WorkItemVO {
    constructor({ id = '', title = '', description = '', cost = 0, qty = 0 }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.cost = cost;
        this.qty = qty;
    }

    get total() { return this.cost * this.qty; }
}

// export default WorkItemVO;