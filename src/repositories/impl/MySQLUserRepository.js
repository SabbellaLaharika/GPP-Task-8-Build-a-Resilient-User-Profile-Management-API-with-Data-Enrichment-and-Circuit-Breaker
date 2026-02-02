const IUserRepository = require('../interfaces/IUserRepository');
const User = require('../../models/User');

class MySQLUserRepository extends IUserRepository {
    constructor(transaction = null) {
        super();
        this.transaction = transaction;
    }

    async create(userData) {
        return await User.create(userData, { transaction: this.transaction });
    }

    async findById(id) {
        return await User.findByPk(id, { transaction: this.transaction });
    }

    async update(id, updates) {
        const user = await this.findById(id);
        if (!user) return null;
        return await user.update(updates, { transaction: this.transaction });
    }

    async delete(id) {
        const user = await this.findById(id);
        if (!user) return false;
        await user.destroy({ transaction: this.transaction });
        return true;
    }

    async findByEmail(email) {
        return await User.findOne({ where: { email }, transaction: this.transaction });
    }
}

module.exports = MySQLUserRepository;
