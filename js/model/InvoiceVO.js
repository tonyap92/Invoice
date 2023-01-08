class InvoiceVO {
    constructor(id = '', items = [], discount = 0, iban = '') {
        this.id = id;
        this.discount = discount;
        this.items = items;
        this.iban = iban;
    }
}

// export default InvoiceVO;