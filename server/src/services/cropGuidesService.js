import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CropGuide } from '../models/cropGuide.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Allow overriding the data file, else use bundled JSON
const DATA_FILE = process.env.CROP_GUIDE_FILE || path.join(__dirname, '..', '..', 'data', 'crop_guides.json')

function loadGuidesFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const guides = JSON.parse(raw)
    if (Array.isArray(guides)) return guides
  } catch (e) {
    console.warn('[crop-guides] failed to load data file', e?.message || e)
  }
  return []
}

export async function listCropGuides() {
  const docs = await CropGuide.find({}).lean()
  if (docs.length) return docs

  // Fallback: hydrate from JSON and upsert so subsequent calls hit Mongo
  const fallback = loadGuidesFromFile()
  if (fallback.length) {
    await upsertCropGuides(fallback).catch((e) => console.warn('[crop-guides] upsert fallback failed', e?.message || e))
  }
  return fallback
}

export async function getCropGuideByName(name) {
  if (!name) return null
  const doc = await CropGuide.findOne({ cropName: new RegExp(`^${name}$`, 'i') }).lean()
  if (doc) return doc

  const fallback = loadGuidesFromFile()
  return fallback.find((g) => g.cropName?.toLowerCase() === String(name).toLowerCase()) || null
}

export async function upsertCropGuides(guides) {
  if (!Array.isArray(guides)) throw new Error('guides must be an array')
  const ops = guides.map((guide) => ({
    updateOne: {
      filter: { cropName: guide.cropName },
      update: guide,
      upsert: true,
      setDefaultsOnInsert: true
    }
  }))
  if (ops.length === 0) return { matched: 0, upserted: 0 }
  const res = await CropGuide.bulkWrite(ops)
  return { matched: res.nMatched, upserted: res.nUpserted }
}
