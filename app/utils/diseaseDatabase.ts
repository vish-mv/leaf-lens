import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface DiseaseInfo {
  diseaseName: string;
  plantName: string;
  cureDetails: string;
}

let diseaseDatabase: DiseaseInfo[] | null = null;

export function loadDiseaseDatabase(): DiseaseInfo[] {
  if (diseaseDatabase) return diseaseDatabase;

  const csvFilePath = path.join(process.cwd(), 'data', 'plant_diseases.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  diseaseDatabase = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as DiseaseInfo[];

  return diseaseDatabase;
}

export function findDiseaseInfo(plantName: string, diseaseName: string): DiseaseInfo | null {
  const database = loadDiseaseDatabase();
  return database.find(entry => 
    entry.plantName.toLowerCase() === plantName.toLowerCase() &&
    entry.diseaseName.toLowerCase() === diseaseName.toLowerCase()
  ) || null;
}