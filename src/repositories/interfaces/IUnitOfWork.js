class IUnitOfWork {
    async startTransaction() { throw new Error("Not implemented"); }
    async commit() { throw new Error("Not implemented"); }
    async rollback() { throw new Error("Not implemented"); }
    getUserRepository() { throw new Error("Not implemented"); }
}

module.exports = IUnitOfWork;
