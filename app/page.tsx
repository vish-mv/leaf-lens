'use client'

import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import PlantInfo from './components/PlantInfo'

export default function Home() {
  const [plantInfo, setPlantInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-green-400 to-blue-500">
      <h1 className="text-4xl font-bold mb-8 text-white">Plant Identifier</h1>
      <ImageUpload setPlantInfo={setPlantInfo} setError={setError} />
      <PlantInfo info={plantInfo} error={error} />
    </main>
  )
}