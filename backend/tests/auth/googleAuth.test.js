const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { verifyGoogleToken } = require('../../utils/googleUtils');

// Mock Google OAuth utilities
jest.mock('../../utils/googleUtils');

describe('Google OAuth Authentication', () => {
    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});

        // Reset all mocks
        jest.clearAllMocks();

        // Set up environment variable for tests
        process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    });

    afterEach(() => {
        // Clean up environment variables
        delete process.env.GOOGLE_CLIENT_ID;
    });

    describe('POST /api/auth/google', () => {
        const mockGoogleUserInfo = {
            googleId: '123456789',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/picture.jpg',
            emailVerified: true
        };

        it('should create user on valid new Google token', async () => {
            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.googleId).toBe(mockGoogleUserInfo.googleId);
            expect(res.body.user.email).toBe(mockGoogleUserInfo.email);
            expect(res.body.user.googleAuthenticated).toBe(true);

            // Verify user was created in database
            const user = await User.findOne({ googleId: mockGoogleUserInfo.googleId });
            expect(user).toBeTruthy();
            expect(user.email).toBe(mockGoogleUserInfo.email);
            expect(user.googleAuthenticated).toBe(true);

            // Verify Google token verification was called
            expect(verifyGoogleToken).toHaveBeenCalledWith('valid-google-token');
        });

        it('should return existing user on repeated login', async () => {
            // Create existing user
            const existingUser = await User.create({
                googleId: mockGoogleUserInfo.googleId,
                email: mockGoogleUserInfo.email,
                username: 'testuser',
                googleAuthenticated: false
            });

            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user._id).toBe(existingUser._id.toString());
            expect(res.body.user.googleId).toBe(mockGoogleUserInfo.googleId);

            // Verify user was updated
            const updatedUser = await User.findById(existingUser._id);
            expect(updatedUser.googleAuthenticated).toBe(true);
        });

        it('should link Google account to existing email user', async () => {
            // Create existing user with same email but no Google ID
            const existingUser = await User.create({
                username: 'existinguser',
                email: mockGoogleUserInfo.email,
                password: 'password123'
            });

            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user._id).toBe(existingUser._id.toString());
            expect(res.body.user.googleId).toBe(mockGoogleUserInfo.googleId);
            expect(res.body.user.googleAuthenticated).toBe(true);

            // Verify user was updated with Google info
            const updatedUser = await User.findById(existingUser._id);
            expect(updatedUser.googleId).toBe(mockGoogleUserInfo.googleId);
            expect(updatedUser.googleAuthenticated).toBe(true);
        });

        it('should reject invalid or expired token', async () => {
            // Mock failed Google token verification
            verifyGoogleToken.mockRejectedValue(new Error('Invalid Google token'));

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'invalid-google-token'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid or expired Google token');

            // Verify no user was created
            const users = await User.find({});
            expect(users).toHaveLength(0);

            // Verify Google token verification was called
            expect(verifyGoogleToken).toHaveBeenCalledWith('invalid-google-token');
        });

        it('should return JWT token on success', async () => {
            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');

            // Verify token is a valid JWT format (basic check)
            const tokenParts = res.body.token.split('.');
            expect(tokenParts).toHaveLength(3);
        });

        it('should reject missing token', async () => {
            const res = await request(app)
                .post('/api/auth/google')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Please provide Google ID token');

            // Verify Google verification was not called
            expect(verifyGoogleToken).not.toHaveBeenCalled();
        });

        it('should handle Google OAuth not configured', async () => {
            // Remove Google client ID to simulate unconfigured OAuth
            delete process.env.GOOGLE_CLIENT_ID;

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Google OAuth is not configured');

            // Verify Google verification was not called
            expect(verifyGoogleToken).not.toHaveBeenCalled();
        });

        it('should generate unique username for users without name', async () => {
            const mockUserInfoWithoutName = {
                ...mockGoogleUserInfo,
                name: null
            };

            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockUserInfoWithoutName);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.username).toMatch(/^user_\w{8}$/);

            // Verify user was created with generated username
            const user = await User.findOne({ googleId: mockGoogleUserInfo.googleId });
            expect(user.username).toMatch(/^user_\w{8}$/);
        });

        it('should handle database errors gracefully', async () => {
            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            // Mock database error by using invalid data
            const invalidEmail = 'invalid-email-format';
            const mockInvalidUserInfo = {
                ...mockGoogleUserInfo,
                email: invalidEmail
            };
            verifyGoogleToken.mockResolvedValue(mockInvalidUserInfo);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Server error');
        });

        it('should clean username from name field', async () => {
            const mockUserInfoWithSpaces = {
                ...mockGoogleUserInfo,
                name: 'Test User With Spaces'
            };

            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockUserInfoWithSpaces);

            const res = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.username).toBe('testuserwithspaces');

            // Verify user was created with cleaned username
            const user = await User.findOne({ googleId: mockGoogleUserInfo.googleId });
            expect(user.username).toBe('testuserwithspaces');
        });
    });

    describe('Google OAuth Integration', () => {
        it('should work with existing authentication middleware', async () => {
            const mockGoogleUserInfo = {
                googleId: '123456789',
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/picture.jpg',
                emailVerified: true
            };

            // Mock successful Google token verification
            verifyGoogleToken.mockResolvedValue(mockGoogleUserInfo);

            // Login with Google
            const loginRes = await request(app)
                .post('/api/auth/google')
                .send({
                    token: 'valid-google-token'
                });

            expect(loginRes.status).toBe(200);
            const { token } = loginRes.body;

            // Use the token to access protected route
            const protectedRes = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(protectedRes.status).toBe(200);
            expect(protectedRes.body.success).toBe(true);
            expect(protectedRes.body.data.googleId).toBe(mockGoogleUserInfo.googleId);
        });
    });
}); 