
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Chef, CuisineType, MenuRecommendation, Dish, Menu, ImageGenConfig, Booking, ChefRequest } from "../types";

const CHEF_PORTRAITS = [
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1625631980396-f5979bc6bc6a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1605851867184-24e05ee20211?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
];

const FALLBACK_CHEFS: Chef[] = [
  {
    id: 'chef-fallback-1',
    name: 'Marco Rossi',
    location: 'London',
    bio: 'Authentic Italian culinary master with 15 years experience in Michelin-starred kitchens across Rome and London.',
    rating: 4.9,
    reviewsCount: 124,
    cuisines: ['Italian', 'Mediterranean'],
    imageUrl: CHEF_PORTRAITS[0],
    minPrice: 85,
    minSpend: 400,
    yearsExperience: 15,
    eventsCount: 340,
    badges: ['Michelin Trained', 'Pasta Master'],
    tags: ['Handmade Pasta', 'Truffle Specialist'],
    menus: []
  }
];

export const handleAIServiceError = (error: any): string => {
  console.error("AI Service Error Detail:", error);
  let errorMessage = "";
  if (typeof error === 'string') errorMessage = error;
  else if (error?.message) errorMessage = error.message;
  else if (typeof error === 'object') errorMessage = JSON.stringify(error);

  if (errorMessage.includes("quotaExceeded") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    return "AI request volume has exceeded the current quota. This is a temporary limit.";
  }
  if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
    return "The requested intelligence model is currently unavailable.";
  }
  return `Strategic Intelligence Error: ${errorMessage.substring(0, 100)}`;
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = JSON.stringify(error).includes("429") || JSON.stringify(error).includes("RESOURCE_EXHAUSTED");
    if (isRateLimit && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const generateSocialCampaign = async (theme: string, context: string): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a high-prestige multi-platform social media campaign.
            Theme: "${theme}"
            Context: "${context}"
            Platforms: Instagram (Visual Focus), Facebook (Narrative Focus), X (Concise, punchy, < 280 chars).
            Include a visual prompt for AI image generation and a base set of luxury hashtags.
            Output JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: {
                            type: Type.OBJECT,
                            properties: {
                                instagram: { type: Type.STRING },
                                facebook: { type: Type.STRING },
                                x_twitter: { type: Type.STRING }
                            }
                        },
                        hashtags: { type: Type.STRING },
                        visualPrompt: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const optimizeHashtags = async (content: string, region: string = "Global Luxury"): Promise<string> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Optimize hashtags for the following content in the ${region} luxury dining market: "${content.substring(0, 200)}". 
            Search for trending keywords using Google Search. Return only a space-separated string of 15-20 optimized hashtags starting with #.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text || "#LuxePlate #PrivateChef #FineDining";
    });
};

export const vetChefApplication = async (request: ChefRequest): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this chef application. Chef: ${request.name}, Niche: ${request.niche}, Exp: ${request.experience} years. JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        recommendation: { type: Type.STRING },
                        suggestedBadges: { type: Type.ARRAY, items: { type: Type.STRING } },
                        riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateMenuDescription = async (menuName: string, courses: Record<string, Dish[]>): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a captivating 1-paragraph narrative for a menu titled "${menuName}". Focus on the sensory experience. High-end tone.`,
    });
    return response.text || "";
  });
};

export const generateDishDescription = async (dishName: string, ingredients: string[]): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a captivating 1-2 sentence narrative for a gourmet dish titled "${dishName}" containing ${ingredients.join(', ')}. Focus on flavor profile.`,
    });
    return response.text || "";
  });
};

export const searchChefs = async (location: string, cuisine: string): Promise<Chef[]> => {
  try {
    return await withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 6 elite chefs in ${location} for ${cuisine}. JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, location: { type: Type.STRING }, bio: { type: Type.STRING }, rating: { type: Type.NUMBER }, reviewsCount: { type: Type.NUMBER }, cuisines: { type: Type.ARRAY, items: { type: Type.STRING } }, imageUrl: { type: Type.STRING }, minPrice: { type: Type.NUMBER }, minSpend: { type: Type.NUMBER }, yearsExperience: { type: Type.NUMBER }, eventsCount: { type: Type.NUMBER }, badges: { type: Type.ARRAY, items: { type: Type.STRING } }, tags: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        }
      });
      return JSON.parse(response.text || "[]");
    });
  } catch (err) { return FALLBACK_CHEFS; }
};

export const generateBookingConfirmation = async (chefName: string, menuName: string, guests: number, date: string, time: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a sophisticated booking confirmation from Chef ${chefName} for ${menuName} on ${date}.`,
    });
    return response.text || "Your booking is confirmed.";
  });
};

export const generateChefTeaser = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt: prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio } });
    while (!operation.done) { await new Promise(resolve => setTimeout(resolve, 10000)); operation = await ai.operations.getVideosOperation({operation: operation}); }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const generateHighQualityImage = async (prompt: string, config: ImageGenConfig): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: config.aspectRatio, imageSize: config.imageSize } },
    });
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
    throw new Error("No image generated.");
  });
};

export const generateMenuCoverImage = async (menuName: string, description: string): Promise<string> => {
    return generateHighQualityImage(
        `Ultra high-end cinematic wide shot representing the culinary collection '${menuName}'. Atmosphere: ${description}. Luxury interior or ingredients, Michelin aesthetic, soft lighting, 8k resolution.`,
        { aspectRatio: "16:9", imageSize: "1K" }
    );
};

export const generateGrowthForecast = async (bookings: any[]): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Analyze these platform bookings and generate a 12-month growth forecast: ${JSON.stringify(bookings.slice(0, 10))}. Include executive summary, projections (month, estimatedRevenue, growthDrivers), and strategic pivots. JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        projections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    month: { type: Type.STRING },
                                    estimatedRevenue: { type: Type.NUMBER },
                                    growthDrivers: { type: Type.STRING }
                                }
                            }
                        },
                        strategicPivots: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateTrafficInsights = async (hub: string): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze luxury dining traffic insights and competitive landscape for the ${hub}. Use web search for accuracy. JSON format.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitiveLandscape: { type: Type.STRING },
                        trafficSources: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateMarketDiscovery = async (location: string): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Conduct a deep market discovery for the luxury private dining sector in ${location}. 
            Specifically analyze: market saturation, major competitors (benchmarking), emerging culinary trends, and expansion opportunities.
            Search real-time data using Google Search. Output JSON format.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        saturationIndex: { type: Type.NUMBER },
                        viabilityScore: { type: Type.NUMBER },
                        competitorBenchmarks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    pricePoint: { type: Type.STRING },
                                    keyStrength: { type: Type.STRING },
                                    marketShare: { type: Type.STRING }
                                }
                            }
                        },
                        emergingTrends: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    trend: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    momentum: { type: Type.STRING }
                                }
                            }
                        },
                        expansionOpportunities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    location: { type: Type.STRING },
                                    reasoning: { type: Type.STRING },
                                    estimatedRevenuePotential: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const text = response.text || "{}";
        const result = JSON.parse(text);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const urls = groundingChunks
            ?.map((chunk: any) => chunk.web?.uri)
            .filter(Boolean) || [];
            
        return {
            ...result,
            groundingSources: urls.length > 0 ? urls : []
        };
    });
};

export const generateBudgetStrategy = async (revenue: number, targetMargin: number): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Platform financial audit: Current Revenue is £${revenue}, Target Margin is £${targetMargin}. Provide strategic margin analysis, cost optimization steps, and reinvestment advice. JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        marginAnalysis: { type: Type.STRING },
                        costOptimizationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reinvestmentAdvice: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateCommTemplate = async (purpose: string, channel: 'EMAIL' | 'SMS'): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a high-prestige, luxury-aligned ${channel} template for the following purpose: ${purpose}. JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateMarketingStrategy = async (niche: string): Promise<string> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Synthesize a high-level marketing strategy for the elite culinary niche: ${niche}. Focus on brand positioning and luxury acquisition channels.`,
        });
        return response.text || "";
    });
};

export const generatePrintAssets = async (type: string): Promise<string> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate conceptual designs and content for physical luxury print assets of type: ${type}. E.g., menu cards, invitation suites, or brand lookbooks.`,
        });
        return response.text || "";
    });
};

export const generateTalentOutreach = async (niche: string): Promise<any> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Develop a comprehensive talent outreach strategy for elite chefs specializing in ${niche}. Include value proposition, recommended recruitment channels, and tailored outreach templates for different platforms. JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        valueProposition: { type: Type.STRING },
                        recruitmentChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                        outreachTemplates: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    channel: { type: Type.STRING },
                                    subject: { type: Type.STRING },
                                    message: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};
