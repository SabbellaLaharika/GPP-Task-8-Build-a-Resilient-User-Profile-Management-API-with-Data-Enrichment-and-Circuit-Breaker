const UserService = require('../../src/services/UserService');
// Mock dependencies
// We need to mock ExternalEnrichmentClient and SequelizeUnitOfWork
// Since UserService requires them, we should mock them before instantiation or use dependency injection/proxyquire if possible.
// For simplicity in Jest, we can use jest.mock

jest.mock('../../src/external/ExternalEnrichmentClient');
jest.mock('../../src/repositories/impl/SequelizeUnitOfWork');

const ExternalEnrichmentClient = require('../../src/external/ExternalEnrichmentClient');
const SequelizeUnitOfWork = require('../../src/repositories/impl/SequelizeUnitOfWork');

describe('UserService Unit Tests', () => {
    let userService;
    let mockUserRepo;
    let mockTransaction;
    let mockUoW;

    beforeEach(() => {
        // Setup Mocks
        mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        mockUserRepo = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockUoW = {
            startTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            getUserRepository: jest.fn().mockReturnValue(mockUserRepo)
        };

        SequelizeUnitOfWork.mockImplementation(() => mockUoW);
        ExternalEnrichmentClient.mockImplementation(() => ({
            fetchEnrichmentData: jest.fn()
        }));

        userService = new UserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user successfully', async () => {
            const userData = { name: 'Test User', email: 'test@example.com' };
            mockUserRepo.findByEmail.mockResolvedValue(null);
            mockUserRepo.create.mockResolvedValue({ id: 'uuid-123', ...userData });

            const result = await userService.createUser(userData);

            expect(mockUoW.startTransaction).toHaveBeenCalled();
            expect(mockUserRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                name: userData.name,
                email: userData.email,
                registrationDate: expect.any(Date)
            }));
            expect(mockUoW.commit).toHaveBeenCalled();
            expect(result).toHaveProperty('id', 'uuid-123');
        });

        it('should throw error if email exists', async () => {
            mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing-id' });

            await expect(userService.createUser({ name: 'User', email: 'exist@example.com' }))
                .rejects.toThrow('Email already exists');

            expect(mockUoW.rollback).toHaveBeenCalled();
            expect(mockUserRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('should return user if found', async () => {
            const mockUser = { id: 'uuid-123', name: 'Test' };
            mockUserRepo.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById('uuid-123');
            expect(result).toEqual(mockUser);
        });

        it('should return null if not found', async () => {
            mockUserRepo.findById.mockResolvedValue(null);
            const result = await userService.getUserById('uuid-123');
            expect(result).toBeNull();
        });
    });
});
