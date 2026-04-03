const DEFAULT_PORT = 5000;
const PLACEHOLDER_AI_KEY = 'your_groq_api_key_here';
const REQUIRED_ENV_KEYS = ['MONGODB_URI', 'JWT_SECRET'];

const cleanEnvValue = (value) => (typeof value === 'string' ? value.trim() : '');

const validateEnv = () => {
    const missing = REQUIRED_ENV_KEYS.filter((key) => !cleanEnvValue(process.env[key]));

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const parsedPort = Number.parseInt(process.env.PORT, 10);

    return {
        port: Number.isFinite(parsedPort) ? parsedPort : DEFAULT_PORT,
        nodeEnv: cleanEnvValue(process.env.NODE_ENV) || 'development',
    };
};

const getAllowedOrigins = () => {
    const rawOrigins = cleanEnvValue(process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN);
    const configuredOrigins = rawOrigins
        ? rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
        : [];

    return [...new Set([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        ...configuredOrigins,
    ])];
};

const isAIConfigured = () => {
    const apiKey = cleanEnvValue(process.env.GROQ_API_KEY);

    return Boolean(apiKey && apiKey !== PLACEHOLDER_AI_KEY);
};

module.exports = {
    getAllowedOrigins,
    isAIConfigured,
    validateEnv,
};
