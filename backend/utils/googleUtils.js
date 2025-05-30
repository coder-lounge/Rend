const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

/**
 * Generate Google OAuth authorization URL
 * @param {string} state - Optional state parameter for CSRF protection
 * @returns {string} - Google OAuth authorization URL
 */
const generateAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    return authUrl;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} - Token information and user data
 */
const exchangeCodeForTokens = async (code) => {
    try {
        // Exchange the authorization code for tokens
        const { tokens } = await client.getTokens(code);

        const userInfo = await verifyGoogleToken(tokens.id_token);

        return {
            tokens,
            userInfo
        };
    } catch (error) {
        console.error('Google code exchange error:', error);
        throw new Error('Failed to exchange authorization code');
    }
};

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
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
};

module.exports = {
    generateAuthUrl,
    exchangeCodeForTokens,
    verifyGoogleToken,
    isGoogleOAuthConfigured
}; 