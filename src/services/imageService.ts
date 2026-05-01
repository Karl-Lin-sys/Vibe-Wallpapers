import { GoogleGenAI } from "@google/genai";

export async function generateWallpapers(
  vibe: string,
  count: number = 4,
  referenceImage?: string
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  // If there's a reference image, we parse it
  let refData: { data: string; mimeType: string } | undefined;
  if (referenceImage) {
    const [header, base64Data] = referenceImage.split(",");
    const match = header.match(/data:(.*?);base64/);
    if (match && match[1]) {
      refData = {
        data: base64Data,
        mimeType: match[1],
      };
    }
  }

  // We make `count` parallel requests to generate variation.
  const promises = Array.from({ length: count }).map(async (_, i) => {
    const parts: any[] = [];
    if (refData) {
      parts.push({
        inlineData: {
          data: refData.data,
          mimeType: refData.mimeType,
        },
      });
      // Vary the prompt slightly to encourage different results even more,
      // though temperature also helps.
      parts.push({
        text: `Remix this reference image. Desired vibe: ${
          vibe || "a similar style but new perspective"
        }. Make it suitable for a beautiful phone wallpaper. Variation ${
          i + 1
        }.`,
      });
    } else {
      parts.push({
        text: `A beautiful phone wallpaper representing: ${vibe}. High aesthetic, professional quality. Variation ${
          i + 1
        }.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
          imageSize: "1K", // Sufficient for phone preview/wallpapers
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType || "image/png"};base64,${
        part.inlineData.data
      }`;
    }
    throw new Error("No image data found in response");
  });

  const results = await Promise.allSettled(promises);
  
  const successfulImages = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value);

  if (successfulImages.length === 0) {
    throw new Error("Failed to generate any images.");
  }

  return successfulImages;
}
