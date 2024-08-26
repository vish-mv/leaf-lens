'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CgSpinner } from 'react-icons/cg'

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

  const prompt = feature === 'identify'
    ? 'Identify this plant and provide its name, scientific name, and a brief description of its characteristics and care requirements.'
    : 'Analyze the health of this plant. Describe any visible issues, potential diseases, or care problems you can identify from the image. Provide recommendations for improving the plant\'s health if necessary.'

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData
      }
    }
  ])

  const response = await result.response
  return response.text()
}