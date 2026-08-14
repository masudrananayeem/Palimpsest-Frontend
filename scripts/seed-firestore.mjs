// One-time helper: pushes the bundled demo artifacts into your Firestore
// project, so the archive isn't empty the first time you connect it.
//
// Usage:
//   1. Firebase Console → Project settings → Service accounts →
//      "Generate new private key" → save as scripts/service-account.json
//      (this file is git-ignored — never commit it).
//   2. cd frontend && npm run seed
//      (or from repo root: node scripts/seed-firestore.mjs)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "service-account.json");

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch {
  console.error(
    `\nCouldn't find scripts/service-account.json.\n` +
      `Download it from Firebase Console → Project settings → Service accounts → Generate new private key,\n` +
      `save it as scripts/service-account.json, and run this again.\n`
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const demoArtifacts = [
  {
    id: "amphora-317",
    title: "Terracotta Amphora, Fragment Set",
    era: "Greek, c. 520 BCE",
    origin: "Attica region",
    category: "Ceramics",
    condition: "Reconstructed · 62% original material",
    contributor: "M. Halloran",
    scans: 4,
    meshVerts: "1.2M",
    status: "restored",
    thumbnailTone: "#A67C52",
    shape: "amphora",
    description:
      "A black-figure amphora recovered in eleven fragments. The digital twin fills gaps using symmetry inference from the surviving decorated panel, flagged in the viewer as synthetic geometry.",
  },
  {
    id: "stele-089",
    title: "Funerary Stele, Upper Register",
    era: "Roman, c. 150 CE",
    origin: "Aquileia",
    category: "Stonework",
    condition: "Weathered · surface intact",
    contributor: "Ines Bakr",
    scans: 7,
    meshVerts: "3.8M",
    status: "in-progress",
    thumbnailTone: "#8B4A3B",
    shape: "stele",
    description:
      "Limestone relief with visible tool marks preserved in the mesh. Inscription restoration is pending epigraphic review before publication.",
  },
  {
    id: "mask-204",
    title: "Ceremonial Mask, Wood & Pigment",
    era: "West African, 19th c.",
    origin: "Private donation, provenance on file",
    category: "Wood & Organic",
    condition: "Stable · pigment loss 30%",
    contributor: "T. Adeyemi",
    scans: 5,
    meshVerts: "2.1M",
    status: "restored",
    thumbnailTone: "#4C7A6E",
    shape: "mask",
    description:
      "Photogrammetric capture across five lighting passes to recover pigment traces invisible to the naked eye. Colour reconstruction is speculative and marked accordingly.",
  },
  {
    id: "tablet-455",
    title: "Cuneiform Tablet, Administrative",
    era: "Old Babylonian, c. 1800 BCE",
    origin: "Excavation lot 455",
    category: "Epigraphy",
    condition: "Fragmented · 4 joins proposed",
    contributor: "R. Solberg",
    scans: 9,
    meshVerts: "0.6M",
    status: "queued",
    thumbnailTone: "#C79966",
    shape: "tablet",
    description:
      "High-resolution reflectance transformation imaging (RTI) captured alongside the mesh scan to make worn sign impressions legible under raking light.",
  },
  {
    id: "urn-140",
    title: "Funerary Urn, Lidded",
    era: "Etruscan, c. 400 BCE",
    origin: "Necropolis site 12",
    category: "Ceramics",
    condition: "Restored · lid original",
    contributor: "M. Halloran",
    scans: 3,
    meshVerts: "1.0M",
    status: "restored",
    thumbnailTone: "#6FA895",
    shape: "urn",
    description:
      "Structured-light scan of a bucchero ware urn. Minor rim chipping left unretouched in the digital model per the archive's minimal-intervention policy.",
  },
  {
    id: "coin-hoard-22",
    title: "Coin Hoard, Lot 22",
    era: "Late Roman, c. 350–400 CE",
    origin: "Riverbank find",
    category: "Metalwork",
    condition: "Corroded · 14 of 31 catalogued",
    contributor: "Ines Bakr",
    scans: 14,
    meshVerts: "4.4M",
    status: "in-progress",
    thumbnailTone: "#B0614E",
    shape: "coins",
    description:
      "Batch micro-CT scanning to read corroded coin faces without physical cleaning. Individual coin models are stitched into a single hoard record.",
  },
];

const run = async () => {
  const batch = db.batch();
  for (const artifact of demoArtifacts) {
    const { id, ...data } = artifact;
    const ref = db.collection("artifacts").doc(id);
    batch.set(ref, { ...data, contributorId: null, createdAt: new Date() }, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${demoArtifacts.length} artifacts into Firestore.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
