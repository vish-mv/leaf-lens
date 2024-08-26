'use client'

import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import PlantInfo from './components/PlantInfo'
import FeatureSelector from './components/FeatureSelector'

export default function Home() {
  const [plantInfo, setPlantInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<'identify' | 'health'>('identify')

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-r from-teal-700 to-teal-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white text-center">Plant Analyzer</h1>
        <p className="text-center text-white mb-6">
          Discover the wonders of nature! Upload an image or take a photo of a plant, and let our AI analyze it for you.
        </p>
        <FeatureSelector selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature} />
        <ImageUpload 
          setPlantInfo={setPlantInfo} 
          setError={setError} 
          setUploadedImage={setUploadedImage}
          selectedFeature={selectedFeature}
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
  )
}