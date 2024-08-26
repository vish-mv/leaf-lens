'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CgSpinner } from 'react-icons/cg'
import { findDiseaseInfo } from '../utils/diseaseDatabase';


interface ImageUploadProps {
  setPlantInfo: (info: string | null) => void
  setError: (error: string | null) => void
  setUploadedImage: (imageUrl: string | null) => void
  selectedFeature: 'identify' | 'health'
}

export default function ImageUpload({ setPlantInfo, setError, setUploadedImage, selectedFeature }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setError('File size exceeds 4MB. Please choose a smaller image.')
      return
    }

    setIsLoading(true)
    setPlantInfo(null)
    setError(null)
    setUploadedImage(URL.createObjectURL(file))

    try {
      const imageData = await readFileAsBase64(file)
      const plantInfo = await analyzePlant(imageData, selectedFeature)
      setPlantInfo(plantInfo)
    } catch (error) {
      console.error('Error analyzing plant:', error)
      setError(`Error analyzing plant: ${error.message}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-6 sm:mb-8 text-center">
      <label className="bg-white text-green-700 px-6 py-3 rounded-lg cursor-pointer hover:bg-green-100 transition-colors inline-block shadow-md">
        {selectedFeature === 'identify' ? 'Upload Plant Image' : 'Upload Plant Health Image'}
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
          <span>Analyzing plant...</span>
        </div>
      )}
    </div>
  )
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function analyzePlant(imageData: string, feature: 'identify' | 'health'): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const healthformat=  "Plant Name: <plant name>\nDisease Name: <disease name>\nDisease Details: <disease details>\nCure Details: <cure details>"
  
    if (feature === 'identify') {
      const prompt = 'Identify this plant and provide its name, scientific name, and a brief description of its characteristics and care requirements.'
      const result = await model.generateContent([prompt, { inlineData: { mimeType: 'image/jpeg', data: imageData } }])
      return result.response.text()
    } else {
      // First, identify the plant and its health issue
      const initialPrompt = 'Identify this plant and any visible health issues or diseases. Provide the plant name and the name of the disease or health problem you observe.'
      const initialResult = await model.generateContent([initialPrompt, { inlineData: { mimeType: 'image/jpeg', data: imageData } }])
      const initialAnalysis = initialResult.response.text()
  
      // Extract plant name and disease name (you might need to adjust this based on Gemini's output format)
      const plantName = extractPlantName(initialAnalysis)
      const diseaseName = extractDiseaseName(initialAnalysis)
  
      // Look up disease info in our database via API
      const diseaseInfo = await fetchDiseaseInfo(plantName, diseaseName)
  
      let finalPrompt = `Analyze the health of this ${plantName}. The initial analysis suggests it may have ${diseaseName}. `
      
      if (diseaseInfo) {
        finalPrompt += `Our database provides the following information about this disease and its cure: ${diseaseInfo.cureDetails}. `
      }
      
      finalPrompt += "Based on this information and your analysis of the image, provide a detailed assessment of the plant's health, confirm or refute the presence of the suggested disease, and offer specific care recommendations. If the database information is relevant, incorporate it into your recommendations.The answer Should Format Like this"+healthformat
  
      const finalResult = await model.generateContent([finalPrompt, { inlineData: { mimeType: 'image/jpeg', data: imageData } }])
      return finalResult.response.text()
    }
  }
  
  async function fetchDiseaseInfo(plantName: string, diseaseName: string): Promise<{ cureDetails: string } | null> {
    try {
      const response = await fetch(`/api/disease?plant=${encodeURIComponent(plantName)}&disease=${encodeURIComponent(diseaseName)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching disease info:', error);
    }
    return null;
  }
  
  function extractPlantName(text: string): string {
    // Implement logic to extract plant name from Gemini's response
    // This is a placeholder implementation
    const match = text.match(/The plant in the image is a (.*?)\./i)
    return match ? match[1] : 'unknown plant'
  }
  
  function extractDiseaseName(text: string): string {
    // Implement logic to extract disease name from Gemini's response
    // This is a placeholder implementation
    const match = text.match(/The plant appears to be suffering from (.*?)\./i)
    return match ? match[1] : 'unknown disease'
  }
  
  