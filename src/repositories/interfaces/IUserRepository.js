class IUserRepository {
    async create(user) { throw new Error("Not implemented"); }
    async findById(id) { throw new Error("Not implemented"); }
    async update(id, updates) { throw new Error("Not implemented"); }
    async delete(id) { throw new Error("Not implemented"); }
    async findByEmail(email) { throw new Error("Not implemented"); }
}

module.exports = IUserRepository;
