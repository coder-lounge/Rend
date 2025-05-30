const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 * @param {string} token - Google ID token
 * @returns {Promise<Object>} - User information from Google
 */
const verifyGoogleToken = async (token) => {
    try {
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Get the payload
        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error('Invalid token payload');
        }

        // Extract user information
        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified
        };
    } catch (error) {
        console.error('Google token verification error:', error);
        throw new Error('Invalid Google token');
    }
};

/**
 * Validate Google OAuth configuration
 * @returns {boolean} - True if Google OAuth is properly configured
 */
const isGoogleOAuthConfigured = () => {
    return !!(process.env.GOOGLE_CLIENT_ID);
};

module.exports = {
    verifyGoogleToken,
    isGoogleOAuthConfigured
}; 