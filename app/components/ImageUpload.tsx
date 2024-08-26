'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ImageUploadProps {
  setPlantInfo: (info: string | null) => void
  setError: (error: string | null) => void
}

export default function ImageUpload({ setPlantInfo, setError }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setPlantInfo(null)
    setError(null)

    try {
      const imageData = await readFileAsBase64(file)
      const plantInfo = await identifyPlant(imageData)
      setPlantInfo(plantInfo)
    } catch (error) {
      console.error('Error identifying plant:', error)
      setError('Error identifying plant. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <label className="bg-white text-blue-500 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
        Upload Plant Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      {isLoading && <p className="mt-4 text-white">Identifying plant...</p>}
    </div>
  )
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function identifyPlant(imageData: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

  const prompt = 'Identify this plant and provide its name, scientific name, and a brief description of its characteristics and care requirements.'

  const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: 'image/jpeg' } }])
  const response = await result.response
  return response.text()
}