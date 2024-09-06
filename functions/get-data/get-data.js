// netlify/functions/chatgpt.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { recipe } = event.queryStringParameters;

    if (!recipe) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Recipe parameter is required' }),
        };
    }

    const apiKey = process.env.CHAT_GPT_API_KEY;
    console.log("API KEY: " + apiKey);

    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `The user will give you a cooking recipe and you must format it in the appropriate JSON format. The JSON format must be structured like this: { "ingredients": [ { "ingredient": "tomato", "amount": "10", "measurement": "g"}, { "ingredient": "potato", "amount": "20", "measurement": "ml"}, ... ] }. Only some measurements are allowed: ml, tsp, tbsp, fl oz, cup, pint, qt, l, gal, mg, g, oz, lb, kg and t. Please use "u" for units (for example '1' potato would be '1' for amount and 'u' for measurement). If the recipe says something like "2 pieces of 180g of ...", then simply write 360g. Please keep the original language of the recipe given (if the recipe is in french, then the ingredient names should be in french).`
                    },
                    {
                        role: 'user',
                        content: recipe
                    }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const jsonOutput = data.choices[0].message.content.trim();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred while processing your request.' }),
        };
    }
};