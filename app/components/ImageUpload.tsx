"use client";

import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CgSpinner } from "react-icons/cg"; // Add this import

interface ImageUploadProps {
  setPlantInfo: (info: string | null) => void;
  setError: (error: string | null) => void;
  setUploadedImage: (imageUrl: string | null) => void;
}

export default function ImageUpload({
  setPlantInfo,
  setError,
  setUploadedImage,
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("File size exceeds 4MB. Please choose a smaller image.");
      return;
    }

    setIsLoading(true);
    setPlantInfo(null);
    setError(null);
    setUploadedImage(URL.createObjectURL(file));

    try {
      const imageData = await readFileAsBase64(file);
      const plantInfo = await identifyPlant(imageData);
      setPlantInfo(plantInfo);
    } catch (error) {
      console.error("Error identifying plant:", error);
      setError(`Error identifying plant: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 sm:mb-8 text-center">
      <label className="bg-white text-blue-500 px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors inline-block shadow-md">
        Upload Plant Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      {isLoading && (
        <div className="mt-4 flex items-center justify-center text-white">
          <CgSpinner className="animate-spin mr-2 text-2xl" />
          <span>Identifying plant...</span>
        </div>
      )}
    </div>
  );
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1]; // Remove the data URL prefix
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function identifyPlant(imageData: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env["NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY"],
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      "Identify this plant and if there any disease that plant have in the imageidentify it too. Provide its name, scientific name, and the name of the disease and small description about that disease. If there are no disease found, mention that it looks healthy.If there are any cure for that disease mention that too. These requirements should be come as point wise categorized markdown language.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Detailed error:", error);
    throw new Error(`Failed to identify plant: ${error.message}`);
  }
}
