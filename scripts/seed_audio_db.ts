import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const config = JSON.parse(fs.readFileSync(path.resolve('./firebase-applet-config.json'), 'utf8'));

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
const customDbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? config.firestoreDatabaseId
  : undefined;
const db = getFirestore(app, customDbId);

async function seedAudio() {
  console.log('Connecting to Firestore database:', config.firestoreDatabaseId);
  const audioFilePath = path.resolve('./public/audio/ling_m.mp3');
  const fileBuffer = fs.readFileSync(audioFilePath);
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:audio/mpeg;base64,${base64Data}`;

  const docData = {
    id: 'm',
    phoneme: 'm',
    fileName: 'WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg',
    originalUri: 'WhatsApp Audio 2026-10-10 at 11.26.32 AM.mpeg',
    mimeType: 'video/mpeg',
    fileSize: fileBuffer.length,
    audioData: dataUrl,
    source: 'whatsapp_upload',
    description: 'Custom authentic vocal hum /m/ phoneme calibrated for Listening Forest and Ling-6 test',
    updatedAt: new Date().toISOString(),
    isReplaced: true
  };

  const docRef = doc(db, 'custom_audio', 'm');
  await setDoc(docRef, docData, { merge: true });
  console.log('Successfully saved /m/ audio file into Firestore collection "custom_audio" (id: m)');

  // Also write to sound_assets collection for global access
  const assetRef = doc(db, 'sound_assets', 'ling_m');
  await setDoc(assetRef, docData, { merge: true });
  console.log('Successfully saved /m/ audio file into Firestore collection "sound_assets" (id: ling_m)');
}

seedAudio()
  .then(() => {
    console.log('Seeding finished successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
