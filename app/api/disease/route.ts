import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

interface DiseaseInfo {
  diseaseName: string;
  plantName: string;
  cureDetails: string;
}

let diseaseDatabase: DiseaseInfo[] | null = null;

function loadDiseaseDatabase(): DiseaseInfo[] {
  if (diseaseDatabase) return diseaseDatabase;

  const csvFilePath = path.join(process.cwd(), 'app', 'data', 'plant_diseases.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  diseaseDatabase = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as DiseaseInfo[];

  return diseaseDatabase;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plantName = searchParams.get('plant');
  const diseaseName = searchParams.get('disease');

  if (!plantName || !diseaseName) {
    return NextResponse.json({ error: 'Plant name and disease name are required' }, { status: 400 });
  }

  const database = loadDiseaseDatabase();
  const diseaseInfo = database.find(entry => 
    entry.plantName.toLowerCase() === plantName.toLowerCase() &&
    entry.diseaseName.toLowerCase() === diseaseName.toLowerCase()
  );

  if (diseaseInfo) {
    return NextResponse.json(diseaseInfo);
  } else {
    return NextResponse.json({ error: 'Disease information not found' }, { status: 404 });
  }
}