interface PlantInfoProps {
    info: string | null
    error: string | null
  }
  
  export default function PlantInfo({ info, error }: PlantInfoProps) {
    if (!info && !error) return null
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Plant Information</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="whitespace-pre-wrap text-gray-700">{info}</p>
        )}
      </div>
    )
  }