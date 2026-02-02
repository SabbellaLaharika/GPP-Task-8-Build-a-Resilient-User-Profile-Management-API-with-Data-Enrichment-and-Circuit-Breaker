const IUnitOfWork = require('../interfaces/IUnitOfWork');
const sequelize = require('../../config/database');
const MySQLUserRepository = require('./MySQLUserRepository');

class SequelizeUnitOfWork extends IUnitOfWork {
    constructor() {
        super();
        this.transaction = null;
        this.userRepository = null;
    }

    async startTransaction() {
        if (this.transaction) throw new Error("Transaction already started");
        this.transaction = await sequelize.transaction();
    }

    async commit() {
        if (!this.transaction) throw new Error("No transaction to commit");
        await this.transaction.commit();
        this.transaction = null;
    }

    async rollback() {
        if (this.transaction) {
            await this.transaction.rollback();
            this.transaction = null;
        }
    }

    getUserRepository() {
        if (!this.userRepository) {
            // Pass the current transaction to the repository
            this.userRepository = new MySQLUserRepository(this.transaction);
        }
        return this.userRepository;
    }
}

module.exports = SequelizeUnitOfWork;
