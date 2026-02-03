const { v4: uuidv4 } = require('uuid');
const SequelizeUnitOfWork = require('../repositories/impl/SequelizeUnitOfWork');
const ExternalEnrichmentClient = require('../external/ExternalEnrichmentClient');

class UserService {
  constructor() {
    this.externalClient = new ExternalEnrichmentClient();
  }

  async createUser(userData) {
    const uow = new SequelizeUnitOfWork();
    try {
      await uow.startTransaction();
      const userRepository = uow.getUserRepository();

      // Check if email already exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists'); // Controller will catch and send 409
      }

      const newUser = {
        id: uuidv4(),
        name: userData.name,
        email: userData.email,
        registrationDate: new Date()
      };

      const createdUser = await userRepository.create(newUser);
      await uow.commit();
      return createdUser;
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }

  async getUserById(id) {
    // For read-only, we can strictly use UoW or just repo if no transaction needed.
    // Spec says "All database interactions... Unit of Work... to manage transactions".
    // For simple reads, transactions aren't strictly necessary but good for consistency.
    const uow = new SequelizeUnitOfWork(); // Assuming we might want isolation
    const userRepository = uow.getUserRepository();
    const user = await userRepository.findById(id);
    return user;
  }

  async updateUser(id, updates) {
    const uow = new SequelizeUnitOfWork();
    try {
        await uow.startTransaction();
        const userRepository = uow.getUserRepository();
        
        const updatedUser = await userRepository.update(id, updates);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        
        await uow.commit();
        return updatedUser;
    } catch (error) {
        await uow.rollback();
        throw error;
    }
  }

  async deleteUser(id) {
    const uow = new SequelizeUnitOfWork();
    try {
        await uow.startTransaction();
        const userRepository = uow.getUserRepository();
        
        const deleted = await userRepository.delete(id);
        if (!deleted) {
            throw new Error('User not found');
        }
        
        await uow.commit();
        return true;
    } catch (error) {
        await uow.rollback();
        throw error;
    }
  }

  async getEnrichedUser(id) {
    // 1. Get local user data
    const user = await this.getUserById(id);
    if (!user) {
        throw new Error('User not found');
    }

    // 2. Fetch external data (Resiliently)
    // The client handles Circuit Breaker & Retry
    const enrichmentData = await this.externalClient.fetchEnrichmentData(id);

    // 3. Merge data
    return {
        ...user.toJSON(), // Convert Sequelize model to JSON
        enrichment: enrichmentData
    };
  }
}

module.exports = UserService;
