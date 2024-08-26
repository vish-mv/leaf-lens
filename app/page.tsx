"use client";

import { useState } from "react";
import ImageUpload from "./components/ImageUpload";
import PlantInfo from "./components/PlantInfo";

export default function Home() {
  const [plantInfo, setPlantInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-r from-green-400 to-green-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white text-center">
          Plant Identifier
        </h1>
        <ImageUpload
          setPlantInfo={setPlantInfo}
          setError={setError}
          setUploadedImage={setUploadedImage}
        />
        <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
          {uploadedImage && (
            <div className="w-full lg:w-1/2">
              <img
                src={uploadedImage}
                alt="Uploaded plant"
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          )}
          <div className="w-full lg:w-1/2">
            <PlantInfo info={plantInfo} error={error} />
          </div>
        </div>
      </div>
    </main>
  );
}
