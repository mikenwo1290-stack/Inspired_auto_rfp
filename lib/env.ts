// Environment variables configuration
export const env = {
    LLAMA_CLOUD_API_KEY: {
    apiKey: process.env.LLAMA_CLOUD_API_KEY || '',
  },
};

// Function to validate required environment variables
export function validateEnv() {
  const requiredVars = [
    { key: 'LLAMA_CLOUD_API_KEY', value: env.LLAMA_CLOUD_API_KEY.apiKey }
  ];

  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    console.error(`
      Missing required environment variables:
      ${missingVars.map(v => `- ${v.key}`).join('\n      ')}
      
      Please set these in your .env.local file
    `);
    return false;
  }
  
  return true;
} 