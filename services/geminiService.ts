import { GoogleGenAI, Type } from "@google/genai";
import { LicensePlateAnalysis, VehicleType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLicensePlate = async (base64Image: string): Promise<LicensePlateAnalysis> => {
  try {
    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: data
            }
          },
          {
            text: `Analyze this image for a parking system. 
            1. Identify the license plate number (alphanumeric, uppercase, no spaces/hyphens).
            2. Identify the vehicle type (Car, Motorbike, Truck, Bicycle).
            3. Identify the vehicle color.
            4. Provide a confidence score (0-1).
            If unclear, make a best guess.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plateNumber: { type: Type.STRING, description: "The extracted license plate characters" },
            vehicleType: { 
              type: Type.STRING, 
              enum: [VehicleType.CAR, VehicleType.MOTORBIKE, VehicleType.TRUCK, VehicleType.BICYCLE],
              description: "Type of vehicle"
            },
            color: { type: Type.STRING, description: "Color of the vehicle" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["plateNumber", "vehicleType", "color", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as LicensePlateAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      plateNumber: "UNKNOWN",
      vehicleType: VehicleType.CAR,
      color: "Unknown",
      confidence: 0
    };
  }
};