const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Nonce = require('../models/Nonce');
const { ethers } = require('ethers');
const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const { createAuthMessage } = require('../utils/walletUtils');

// Generate a proper test wallet
const testEvmWallet = ethers.Wallet.createRandom();

// Test data
const testWallet = {
    evm: {
        privateKey: testEvmWallet.privateKey,
        address: testEvmWallet.address
    }
};

// Helper function to create EVM signature
const createEvmSignature = async (message, privateKey) => {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
};

// Helper function to create Solana signature
const createSolanaSignature = (message, keypair) => {
    const messageBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    return Buffer.from(signature).toString('base64');
};

describe('Wallet Authentication', () => {
    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});
        await Nonce.deleteMany({});
    });

    describe('POST /api/auth/wallet/nonce', () => {
        it('should generate nonce for EVM wallet', async () => {
            const res = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.nonce).toBeDefined();
            expect(res.body.data.message).toContain('Sign this message to authenticate with Rend');
            expect(res.body.data.message).toContain(res.body.data.nonce);
        });

        it('should generate nonce for Solana wallet', async () => {
            const solanaKeypair = Keypair.generate();

            const res = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: solanaKeypair.publicKey.toString(),
                    walletType: 'solana'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.nonce).toBeDefined();
            expect(res.body.data.message).toContain('Sign this message to authenticate with Rend');
        });

        it('should reject invalid wallet type', async () => {
            const res = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'invalid'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid wallet type');
        });

        it('should reject missing wallet address', async () => {
            const res = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletType: 'evm'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Please provide wallet address and wallet type');
        });
    });

    describe('POST /api/auth/wallet', () => {
        it('should authenticate with valid EVM signature and create new user', async () => {
            // First get a nonce
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const { nonce, message } = nonceRes.body.data;

            // Create signature
            const signature = await createEvmSignature(message, testWallet.evm.privateKey);

            // Authenticate
            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message,
                    walletType: 'evm'
                });

            expect(authRes.status).toBe(200);
            expect(authRes.body.success).toBe(true);
            expect(authRes.body.token).toBeDefined();
            expect(authRes.body.user.walletAddress).toBe(testWallet.evm.address.toLowerCase());
            expect(authRes.body.user.walletType).toBe('evm');
            expect(authRes.body.user.walletAuthenticated).toBe(true);

            // Verify user was created in database
            const user = await User.findOne({ walletAddress: testWallet.evm.address.toLowerCase() });
            expect(user).toBeTruthy();
            expect(user.walletType).toBe('evm');
        });

        it('should authenticate with valid Solana signature and create new user', async () => {
            const solanaKeypair = Keypair.generate();
            const walletAddress = solanaKeypair.publicKey.toString();

            // First get a nonce
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress,
                    walletType: 'solana'
                });

            const { nonce, message } = nonceRes.body.data;

            // Create signature
            const signature = createSolanaSignature(message, solanaKeypair);

            // Authenticate
            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress,
                    signature,
                    message,
                    walletType: 'solana'
                });

            expect(authRes.status).toBe(200);
            expect(authRes.body.success).toBe(true);
            expect(authRes.body.token).toBeDefined();
            expect(authRes.body.user.walletAddress).toBe(walletAddress);
            expect(authRes.body.user.walletType).toBe('solana');
        });

        it('should authenticate existing wallet user', async () => {
            // Create existing user
            const existingUser = await User.create({
                walletAddress: testWallet.evm.address.toLowerCase(),
                walletType: 'evm',
                walletAuthenticated: false
            });

            // Get nonce and authenticate
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const { message } = nonceRes.body.data;
            const signature = await createEvmSignature(message, testWallet.evm.privateKey);

            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message,
                    walletType: 'evm'
                });

            expect(authRes.status).toBe(200);
            expect(authRes.body.success).toBe(true);
            expect(authRes.body.user._id).toBe(existingUser._id.toString());

            // Verify user was updated
            const updatedUser = await User.findById(existingUser._id);
            expect(updatedUser.walletAuthenticated).toBe(true);
        });

        it('should reject invalid signature', async () => {
            // Get nonce
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const { message } = nonceRes.body.data;

            // Use invalid signature
            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature: '0xinvalidsignature',
                    message,
                    walletType: 'evm'
                });

            expect(authRes.status).toBe(401);
            expect(authRes.body.success).toBe(false);
            expect(authRes.body.message).toContain('Invalid signature');
        });

        it('should reject used nonce', async () => {
            // Get nonce
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const { message } = nonceRes.body.data;
            const signature = await createEvmSignature(message, testWallet.evm.privateKey);

            // First authentication (should succeed)
            await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message,
                    walletType: 'evm'
                });

            // Second authentication with same nonce (should fail)
            const authRes2 = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message,
                    walletType: 'evm'
                });

            expect(authRes2.status).toBe(400);
            expect(authRes2.body.success).toBe(false);
            expect(authRes2.body.message).toContain('Invalid or expired nonce');
        });

        it('should reject invalid nonce format', async () => {
            const invalidMessage = 'Invalid message without proper nonce format';
            const signature = await createEvmSignature(invalidMessage, testWallet.evm.privateKey);

            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message: invalidMessage,
                    walletType: 'evm'
                });

            expect(authRes.status).toBe(400);
            expect(authRes.body.success).toBe(false);
            expect(authRes.body.message).toContain('Invalid message format');
        });

        it('should reject missing required fields', async () => {
            const authRes = await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    // Missing signature, message, walletType
                });

            expect(authRes.status).toBe(400);
            expect(authRes.body.success).toBe(false);
            expect(authRes.body.message).toContain('Please provide wallet address, signature, message, and wallet type');
        });
    });

    describe('Nonce Management', () => {
        it('should create nonce in database', async () => {
            await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const nonce = await Nonce.findOne({ walletAddress: testWallet.evm.address.toLowerCase() });
            expect(nonce).toBeTruthy();
            expect(nonce.used).toBe(false);
        });

        it('should mark nonce as used after successful authentication', async () => {
            // Get nonce
            const nonceRes = await request(app)
                .post('/api/auth/wallet/nonce')
                .send({
                    walletAddress: testWallet.evm.address,
                    walletType: 'evm'
                });

            const { message } = nonceRes.body.data;
            const signature = await createEvmSignature(message, testWallet.evm.privateKey);

            // Authenticate
            await request(app)
                .post('/api/auth/wallet')
                .send({
                    walletAddress: testWallet.evm.address,
                    signature,
                    message,
                    walletType: 'evm'
                });

            // Check nonce is marked as used
            const nonce = await Nonce.findOne({ walletAddress: testWallet.evm.address.toLowerCase() });
            expect(nonce.used).toBe(true);
        });
    });
}); 