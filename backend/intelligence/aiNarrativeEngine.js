/**
 * AI Narrative Engine — All AI API interactions.
 * Generates natural-language explanations from structured data.
 * Uses a server-side API key via aiService._getAIModel().
 */

const aiService = require('../services/aiService');

// ── Internal: get AI model ──
const getModel = () => aiService._getAIModel();

// ── Prompt Templates ──

const PROMPTS = {
    reorder: (rec) => `You are a retail inventory advisor. Explain this reorder recommendation to a store owner in 2-3 simple sentences:

Product: ${rec.productName}
Current stock: ${rec.currentStock} units
Average daily sales: ${rec.averageDailySales} units/day
Days until stockout: ${rec.daysUntilStockout} days
Recommended reorder: ${rec.recommendedReorderQuantity} units

Include: why reorder is needed, demand trend, and the suggested quantity. Be direct and actionable.
CRITICAL: Never use asterisks (*). Do not use markdown. For headings or emphasis, use ALL CAPS. Output exactly plain text.`,

    forecast: (data) => `You are a retail data analyst. Based on this demand forecast data:
${JSON.stringify(data, null, 2)}

In 2-3 sentences, explain the trend and give one actionable recommendation. Be specific with numbers.
CRITICAL: Never use asterisks (*). Do not use markdown. For headings or emphasis, use ALL CAPS. Output exactly plain text.`,

    anomaly: (anomaly) => `You are a retail fraud/anomaly analyst. This unusual activity was detected:
Type: ${anomaly.type}
Details: ${anomaly.description}
Data: ${JSON.stringify(anomaly.data)}

In 2-3 sentences, explain what this might mean and what action the store manager should take. Be specific.
CRITICAL: Never use asterisks (*). Do not use markdown. For headings or emphasis, use ALL CAPS. Output exactly plain text.`,

    insight: (type, product, currency) => {
        const prompts = {
            dead: `This product hasn't sold in 30+ days: ${product.name} (Stock: ${product.quantity}, Price: ${currency}${product.sellingPrice}). In 2-3 sentences, explain why it might not be selling and suggest 2 specific actions the store manager can take.`,
            discount: `This product is expiring soon and overstocked: ${product.name} (Stock: ${product.quantity}, Expires: ${new Date(product.expiryDate).toLocaleDateString()}, Price: ${currency}${product.sellingPrice}). In 2-3 sentences, suggest a discount strategy with specific percentages.`,
            reorder: `This product is running low: ${product.name} (Stock: ${product.quantity}, Price: ${currency}${product.sellingPrice}). In 1-2 sentences, recommend a reorder quantity and urgency level.`,
        };
        return `You are a retail inventory analyst. ${prompts[type] || prompts.dead} Be specific and actionable.
CRITICAL: Never use asterisks (*). Do not use markdown. For headings or emphasis, use ALL CAPS. Output exactly plain text.`;
    },

    briefing: (context, currency) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        return `You are MyMart AI writing a briefing for the store manager.
Current Date and Time: ${dateString}, ${timeString}
Active Currency: ${currency}

${context}

Generate a concise, friendly briefing based on the current time of day (e.g. Good morning, Good afternoon, or Good evening) (3-5 sentences max). Include:
1. Yesterday/today's performance summary with revenue and order count
2. Any urgent alerts (low stock, expiring items)
3. One actionable recommendation

Format: Use emoji sparingly (1-2 max). Be specific with numbers. Sound like a smart colleague, not a robot.
CRITICAL: Format currency exclusively using the Active Currency symbol (${currency}) instead of generic indicators like $, assuming all context prices correspond to this currency. Never use asterisks (*). Do not use markdown like **bold**. For headings or emphasis, use ALL CAPS. Output entirely in plain text with correct grammar.`;
    },

    chat: (context, question, currency) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        return `You are MyMart AI — a smart retail assistant for a supermarket management platform.
Current Date and Time: ${dateString}, ${timeString}
Active Currency: ${currency}
You have access to the following real-time store data:

${context}

RULES:
- Be concise, friendly, and data-driven
- Use numbers and percentages when answering
- If asked about something not in the data, say so honestly
- Format currency exclusively using the Active Currency symbol (${currency}) instead of generic indicators like $, assuming all context prices correspond to this currency.
- Keep responses under 200 words unless the user asks for detail
- Use proper capitalization and grammar.
- Use hyphens (-) for lists, but NEVER use asterisks (*).
- If you need to emphasize a heading, type it in ALL CAPS followed by a colon (e.g., INVENTORY STATUS:).
- CRITICAL: Do not type the '*' character anywhere in your response. Output PLAIN TEXT ONLY.
- Never make up data — only use what's provided above

USER QUESTION: ${question}`;
    },
};

/**
 * Generate AI narrative for a reorder recommendation.
 */
const explainReorder = async (recommendation) => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.reorder(recommendation));
    return result.response.text();
};

/**
 * Generate AI narrative for a forecast.
 */
const explainForecast = async (forecastData) => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.forecast(forecastData));
    return result.response.text();
};

/**
 * Generate AI narrative for an anomaly.
 */
const explainAnomaly = async (anomalyData) => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.anomaly(anomalyData));
    return result.response.text();
};

/**
 * Generate AI narrative for an insight.
 */
const explainInsight = async (insightType, productData, currency = '$') => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.insight(insightType, productData, currency));
    return result.response.text();
};

/**
 * Generate daily briefing.
 */
const generateBriefing = async (contextSummary, currency = '$') => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.briefing(contextSummary, currency));
    return result.response.text();
};

/**
 * Handle AI chat with store context.
 */
const chat = async (contextSummary, userMessage, currency = '$') => {
    const model = getModel();
    const result = await model.generateContent(PROMPTS.chat(contextSummary, userMessage, currency));
    return result.response.text();
};

module.exports = {
    explainReorder,
    explainForecast,
    explainAnomaly,
    explainInsight,
    generateBriefing,
    chat,
    PROMPTS,
};
