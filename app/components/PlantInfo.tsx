import ReactMarkdown from "react-markdown";

interface PlantInfoProps {
  info: string | null;
  error: string | null;
}

export default function PlantInfo({ info, error }: PlantInfoProps) {
  if (!info && !error) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Plant Information
      </h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown>{info || ""}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
