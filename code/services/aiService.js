// Fetch heavy metals thresholds from Firebase
export async function getHeavyMetalsThresholds() {
  const metalsRef = ref(db, 'Heavy_Metals'); // Updated path to match Firebase reference
  const snapshot = await get(metalsRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error('No heavy metals data found in Firebase');
  }
}
// AI Service for generating pollution factor explanations
import { db } from '../firebase.js';
import { ref, get } from 'firebase/database';

class AIService {
  // Get SerpAPI key from Firebase
  async getSerpApiKey() {
    if (this.serpApiKey) return this.serpApiKey;
    const apiKeyRef = ref(db, 'SERP_API');
    const snapshot = await get(apiKeyRef);
    if (snapshot.exists()) {
      this.serpApiKey = snapshot.val();
      return this.serpApiKey;
    } else {
      throw new Error('SerpAPI key not found in Firebase');
    }
  }

  async getGeminiApiKey() {
    if (this.apiKey) return this.apiKey;
    const apiKeyRef = ref(db, 'GEMINI_API_KEY');
    const snapshot = await get(apiKeyRef);
    if (snapshot.exists()) {
      this.apiKey = snapshot.val();
      return this.apiKey;
    } else {
      throw new Error('Gemini API key not found in Firebase');
    }
  }

  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    // Predefined pollution factor data
    this.pollutionData = {
      'Heavy Metals': {
        overview: "Heavy metals accumulate in aquatic organisms and food chains, causing serious environmental and health risks. Concentrations vary by location and pollution source.",
        sources: [
          "Industrial discharge from mining, manufacturing, and smelting",
          "Agricultural runoff from pesticides and fertilizers",
          "Urban stormwater from roads and surfaces",
          "Atmospheric deposition from emissions",
          "Natural weathering and erosion"
        ],
        impacts: [
          "Aquatic life toxicity and reproductive problems",
          "Bioaccumulation up the food chain",
          "Human health risks including neurological damage",
          "Ecosystem disruption and biodiversity loss",
          "Water treatment complications"
        ],
        measurements: [
          "Arsenic (As)",
          "Cadmium (Cd)",
          "Chromium (Cr)",
          "Copper (Cu)",
          "Lead (Pb)",
          "Mercury (Hg)",
          "Nickel (Ni)",
          "Zinc (Zn)"
        ]
      },
      'Heavy Metals Concentration': {
        overview: "Heavy metals accumulate in aquatic organisms and food chains, causing serious environmental and health risks. Concentrations vary by location and pollution source.",
        sources: [
          "Industrial discharge from mining, manufacturing, and smelting",
          "Agricultural runoff from pesticides and fertilizers",
          "Urban stormwater from roads and surfaces",
          "Atmospheric deposition from emissions",
          "Natural weathering and erosion"
        ],
        impacts: [
          "Aquatic life toxicity and reproductive problems",
          "Bioaccumulation up the food chain",
          "Human health risks including neurological damage",
          "Ecosystem disruption and biodiversity loss",
          "Water treatment complications"
        ],
        measurements: [
          "Arsenic (As)",
          "Cadmium (Cd)",
          "Chromium (Cr)",
          "Copper (Cu)",
          "Lead (Pb)",
          "Mercury (Hg)",
          "Nickel (Ni)",
          "Zinc (Zn)"
        ]
      },
      'E.coli Bacterial Levels': {
        overview: "E.coli bacteria indicate fecal contamination in water, signaling sewage pollution and potential health hazards for aquatic life and humans.",
        sources: [
          "Sewage overflow and treatment plant discharge",
          "Animal waste from livestock operations",
          "Urban runoff carrying pet waste",
          "Failing septic systems and infrastructure",
          "Wildlife and waterfowl contamination"
        ],
        impacts: [
          "Waterborne disease transmission",
          "Beach and recreational area closures",
          "Shellfish harvesting restrictions",
          "Tourism and economic impact",
          "Ecosystem health degradation"
        ],
        measurements: [
          "E. coli CFU/100ml",
          "Total Coliform",
          "Fecal Coliform",
          "Enterococcus",
          "Fecal Streptococcus",
          "Turbidity levels",
          "pH levels",
          "Temperature"
        ]
      },
      'Chemical Pollutants': {
        overview: "Synthetic and natural chemicals harm water quality and ecosystem health. These contaminants persist in the environment causing acute and chronic effects.",
        sources: [
          "Industrial wastewater with solvents and acids",
          "Agricultural pesticides and herbicides",
          "Urban sewage and household products",
          "Oil spills and petroleum runoff",
          "Atmospheric chemical deposition"
        ],
        impacts: [
          "Acute toxicity to aquatic organisms",
          "Endocrine disruption in fish",
          "Carcinogenic effects on wildlife and humans",
          "Food web and ecosystem disruption",
          "Drinking water contamination"
        ],
        measurements: [
          "Total Organic Carbon (TOC)",
          "Chemical Oxygen Demand (COD)",
          "Petroleum Hydrocarbons",
          "Pesticide Residues",
          "Pharmaceutical Compounds",
          "Volatile Organic Compounds (VOCs)",
          "Polychlorinated Biphenyls (PCBs)",
          "Dioxins and Furans"
        ]
      },
      'Nutrient Overload': {
        overview: "Excess nutrients, particularly nitrogen and phosphorus, lead to eutrophication causing harmful algal blooms and oxygen depletion in aquatic ecosystems.",
        sources: [
          "Agricultural fertilizer runoff",
          "Urban lawn and garden fertilizers",
          "Sewage treatment plant discharge",
          "Animal feeding operations",
          "Stormwater runoff"
        ],
        impacts: [
          "Harmful algal bloom formation",
          "Oxygen depletion and hypoxia",
          "Fish kills and marine life death",
          "Degraded water quality for recreation",
          "Ecosystem imbalance"
        ],
        measurements: [
          "Nitrates (NO3-)",
          "Nitrites (NO2-)",
          "Phosphates (PO4-)",
          "Ammonia (NH3)",
          "Chlorophyll-a",
          "Dissolved Oxygen",
          "Total Nitrogen",
          "Total Phosphorus"
        ]
      },
      'Bacterial Contamination': {
        overview: "Pathogenic bacteria pose immediate threats to water quality and public health. They indicate sewage pollution and can cause serious waterborne diseases.",
        sources: [
          "Untreated sewage discharge",
          "Agricultural animal waste runoff",
          "Urban stormwater with pet waste",
          "Failed septic systems",
          "Wildlife and waterfowl"
        ],
        impacts: [
          "Waterborne diseases like cholera and typhoid",
          "Beach and water body closures",
          "Economic impact on tourism and fishing",
          "Oxygen depletion in water bodies",
          "Public health emergencies"
        ],
        measurements: [
          "E. coli",
          "Total Coliform",
          "Fecal Coliform",
          "Enterococcus",
          "Salmonella",
          "Clostridium perfringens",
          "Fecal Streptococcus",
          "Heterotrophic Plate Count"
        ]
      }
    };
  }


  async getApiKey() {
    return this.getGeminiApiKey();
  }

  async generatePollutionFactorData(factorType) {
    // Return predefined data instead of AI generation
    console.log('Retrieving predefined data for:', factorType);
    
    const data = this.pollutionData[factorType];
    if (data) {
      console.log('Found predefined data for:', factorType);
      return data;
    } else {
      console.warn('No predefined data found for:', factorType);
      // Return default structure if specific factor not found
      return {
        overview: `Data for ${factorType} is being updated. Please check back later.`,
        sources: ["Data being updated"],
        impacts: ["Data being updated"], 
        measurements: ["Data being updated"]
      };
    }
  }

  async chatWithBot(userQuestion, pollutionFactorContext = null) {
    const apiKey = await this.getApiKey();

    let contextInfo = "";
    if (pollutionFactorContext) {
      contextInfo = `
      Current pollution factor context: ${pollutionFactorContext.title}
      Overview: ${pollutionFactorContext.details?.overview || 'Loading...'}
      `;
    }

    const prompt = `You are EcoFish AI, an expert water quality monitoring assistant specializing in the Kinneret (Sea of Galilee) ecosystem. 
    ${contextInfo}
    Please answer directly and concisely.
    User question: "${userQuestion}"
    
    Provide helpful, accurate responses about:
    - Kinneret (Sea of Galilee) water quality and monitoring
    - Environmental conditions in the Kinneret ecosystem
    - Water pollution factors affecting the Kinneret
    - Fish populations and aquatic life in the Kinneret
    - Water management and conservation in the Kinneret region
    - Environmental monitoring techniques used in the Kinneret
    - Historical and current environmental trends in the Kinneret
    
    Keep responses:
    - Conversational and friendly
    - Scientifically accurate about the Kinneret ecosystem
    - Under 200 words
    - Actionable when possible
    - Focused specifically on the Kinneret (Sea of Galilee)
    - Include relevant details about this unique freshwater lake ecosystem
    
    If the question is unrelated to the Kinneret or water quality monitoring, politely redirect to your expertise area focusing on the Kinneret ecosystem.`;

    try {
      console.log('Sending chat request to:', `${this.baseUrl}?key=${apiKey.substring(0, 10)}...`);
      console.log('Chat prompt:', prompt);
      
      const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      console.log('Chat response status:', response.status);
      console.log('Chat response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat API Error Response:', errorText);
        throw new Error(`AI chat request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Chat response data:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid chat response structure:', data);
        throw new Error('Invalid response structure from AI API');
      }
      
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Return only text response, no videos
      return textResponse;
    } catch (error) {
      console.error('AI chat error details:', error);
      
      // More specific error messages
      if (error.message.includes('403')) {
        throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
      } else if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid request format. The question might be too long or contain unsupported content.');
      } else if (error.message.includes('404')) {
        throw new Error('API endpoint not found. There might be an issue with the Gemini API URL or your API key.');
      } else {
        throw error;
      }
    }
  }

  async getQuickSuggestions(pollutionFactorContext = null) {
    const kinneretSuggestions = [
      "What's the current water quality status of the Kinneret?",
      "How does pollution affect fish populations in the Kinneret?",
      "What are the main environmental threats to the Kinneret?",
      "How is the Kinneret water quality monitored?",
      "What are normal vs concerning levels for the Kinneret?",
      "How does the Kinneret ecosystem respond to pollution?",
      "What conservation efforts protect the Kinneret?",
      "How can communities help preserve the Kinneret water quality?"
    ];

    if (pollutionFactorContext) {
      const contextSpecific = [
        `How does ${pollutionFactorContext.title.toLowerCase()} affect the Kinneret ecosystem?`,
        `What are the sources of ${pollutionFactorContext.title.toLowerCase()} in the Kinneret region?`,
        `How is ${pollutionFactorContext.title.toLowerCase()} monitored in the Kinneret?`
      ];
      return [...contextSpecific, ...kinneretSuggestions.slice(0, 5)];
    }

    return kinneretSuggestions;
  }

  // Debug method to test API connectivity
  async testConnection() {
    try {
      const apiKey = await this.getApiKey();
      console.log('=== API CONNECTION TEST ===');
      console.log('API Key retrieved:', apiKey ? 'Yes' : 'No');
      console.log('API Key length:', apiKey ? apiKey.length : 0);
      console.log('API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'null');
      console.log('Endpoint URL:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message. Please respond with 'Test successful'."
            }]
          }]
        })
      });

      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test failed - Error response:', errorText);
        return { success: false, error: `${response.status}: ${errorText}` };
      }

      const data = await response.json();
      console.log('Test successful - Response data:', data);
      console.log('=== END CONNECTION TEST ===');
      return { success: true, response: data };
    } catch (error) {
      console.error('Test connection error:', error);
      console.log('=== CONNECTION TEST FAILED ===');
      return { success: false, error: error.message };
    }
  }

  // Test Firebase API key retrieval
  async testFirebaseConnection() {
    try {
      console.log('=== FIREBASE CONNECTION TEST ===');
      
      // Clear cached key to force fresh retrieval
      this.apiKey = null;
      console.log('Cleared cached API key');
      
      const apiKey = await this.getApiKey();
      
      console.log('Firebase test results:');
      console.log('- API Key retrieved:', apiKey ? 'SUCCESS' : 'FAILED');
      console.log('- Key length:', apiKey ? apiKey.length : 0);
      console.log('- Key format check:', apiKey && apiKey.startsWith('AIza') ? 'VALID' : 'INVALID');
      console.log('- Key preview:', apiKey ? apiKey.substring(0, 15) + '...' : 'null');
      console.log('=== END FIREBASE TEST ===');
      
      return { 
        success: !!apiKey, 
        apiKey: apiKey ? apiKey.substring(0, 15) + '...' : null,
        length: apiKey ? apiKey.length : 0,
        validFormat: apiKey && apiKey.startsWith('AIza')
      };
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      console.log('=== FIREBASE TEST FAILED ===');
      return { success: false, error: error.message };
    }
  }
}

export default new AIService();