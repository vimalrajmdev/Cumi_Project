let config = {};

export const loadConfig = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) throw new Error('Primary config load failed');
    config = await response.json();
  } catch (error) {
    console.warn("Primary config.json failed. Trying fallback...");

    try {
      const fallbackResponse = await fetch('/config.fallback.json');
      if (!fallbackResponse.ok) throw new Error('Fallback config load failed');
      config = await fallbackResponse.json();
    } catch (fallbackError) {
      console.error("Both config.json and fallback config.fallback.json failed to load.");
      config = {}; // Final fallback to empty object
    }
  }
};

export const getConfig = () => config;

