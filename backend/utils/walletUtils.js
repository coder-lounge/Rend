const { ethers } = require('ethers');
const { PublicKey } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const crypto = require('crypto');

/**
 * Verify EVM wallet signature (MetaMask)
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature from the wallet
 * @param {string} expectedAddress - The expected wallet address
 * @returns {boolean} - True if signature is valid
 */
const verifyEvmSignature = (message, signature, expectedAddress) => {
    try {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // Compare addresses (case-insensitive)
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('EVM signature verification error:', error);
        return false;
    }
};

/**
 * Verify Solana wallet signature (Phantom)
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature from the wallet (base58 encoded)
 * @param {string} publicKey - The public key of the wallet (base58 encoded)
 * @returns {boolean} - True if signature is valid
 */
const verifySolanaSignature = (message, signature, publicKey) => {
    try {
        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);

        // Decode signature and public key from base58
        const signatureBytes = Buffer.from(signature, 'base64');
        const publicKeyBytes = new PublicKey(publicKey).toBytes();

        // Verify signature
        return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
        console.error('Solana signature verification error:', error);
        return false;
    }
};

/**
 * Generate a random nonce for wallet authentication
 * @returns {string} - Random nonce string
 */
const generateNonce = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Create authentication message with nonce
 * @param {string} nonce - The nonce to include in the message
 * @returns {string} - The message to be signed
 */
const createAuthMessage = (nonce) => {
    return `Sign this message to authenticate with Rend.\n\nNonce: ${nonce}`;
};

/**
 * Normalize wallet address based on wallet type
 * @param {string} address - The wallet address
 * @param {string} walletType - The wallet type ('evm' or 'solana')
 * @returns {string} - Normalized address
 */
const normalizeWalletAddress = (address, walletType) => {
    if (walletType === 'evm') {
        return address.toLowerCase();
    }
    return address; // Solana addresses are case-sensitive
};

module.exports = {
    verifyEvmSignature,
    verifySolanaSignature,
    generateNonce,
    createAuthMessage,
    normalizeWalletAddress
}; 