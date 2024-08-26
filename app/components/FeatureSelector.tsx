interface FeatureSelectorProps {
    selectedFeature: 'identify' | 'health'
    setSelectedFeature: (feature: 'identify' | 'health') => void
  }
  
  export default function FeatureSelector({ selectedFeature, setSelectedFeature }: FeatureSelectorProps) {
    return (
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 rounded-l-lg ${selectedFeature === 'identify' ? 'bg-green-500 text-white' : 'bg-white text-green-700'}`}
          onClick={() => setSelectedFeature('identify')}
        >
          Plant Identifier
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${selectedFeature === 'health' ? 'bg-green-500 text-white' : 'bg-white text-green-700'}`}
          onClick={() => setSelectedFeature('health')}
        >
          Plant Health Checker
        </button>
      </div>
    )
  }