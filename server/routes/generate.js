import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

function buildPrompt(artworkText) {
  return `You are an expert art historian and museum educator helping docents lead engaging gallery tours.

I'm an art docent preparing a presentation for an in-person tour. My audience is adults with varied backgrounds — assume curiosity but no formal art training.

## The Artwork
[Image is attached]

## Background Information Provided by Docent
${artworkText || 'No additional information provided.'}

---

Create a comprehensive presentation guide with the following sections:

### 1. Overview
Write a vivid, engaging 2-3 paragraph description of this artwork. Open with a hook that captures attention. Describe what we're looking at in a way that makes someone want to lean in closer.

### 2. Visual Analysis
Guide the viewer's eye through the composition systematically:
- What draws the eye first, and why?
- Color palette and emotional impact
- Use of light, shadow, and contrast
- Composition and spatial relationships
- Brushwork, texture, or technique (if visible)
- Any symbolism or visual motifs

Help docents point out details visitors might miss on their own.

### 3. Talking Points
Provide 3 compelling talking points that:
- Connect the artwork to universal human experiences
- Reveal something surprising or counterintuitive
- Give the docent a "wow moment" to share

### 4. Fun Facts
Include 2-4 memorable facts about:
- The artist's life or personality
- The creation of this specific work
- The artwork's provenance, reception, or cultural impact
- Any mysteries, controversies, or amusing anecdotes

Prioritize facts that are memorable and shareable — things visitors will tell someone about later.

### 5. Historical Context
Address two dimensions:
- **Art Historical**: Where does this fit in the artist's body of work? What movement or period does it represent? How was it received?
- **World Historical**: If the artwork depicts or relates to historical events, people, or places, provide accurate context. What was happening in the world when this was created?

### 6. Discussion Questions
Provide 3 open-ended questions designed to:
- Encourage close looking (not just opinion-sharing)
- Have no single "correct" answer
- Be accessible to art novices while rewarding deeper thought
- Spark conversation between visitors, not just docent-to-group

Avoid questions that feel like a quiz or that might embarrass someone who doesn't know art terminology.

### 7. Presentation Flow
Outline a 10-minute presentation. Use this EXACT format for each step:

Step Name (time):
What to say and do for this step.

Example format:
Opening Hook (30 sec):
Start with a compelling question or statement. Pause for effect.

Visual Analysis (3 min):
Guide viewers through the composition. Gesture to specific areas.

Include stage directions in the description like "pause here," "gesture to this area," or "invite viewers to step closer."

Do NOT use markdown bold (**) or brackets []. Do NOT use labels like "Transition:". Each step should have the timing in parentheses after the step name, followed by a colon, then the instructions on what to say and do.

---

## Tone Guidelines
- Warm and conversational, like a knowledgeable friend
- Confident but not condescending
- Enthusiastic without being performative
- Use "you" and "we" to include the audience
- Avoid jargon; if art terms are necessary, briefly define them

## Response Format
Return a JSON object with these exact keys:
{
  "overview": "string",
  "visualAnalysis": "string",
  "talkingPoints": ["string", "string", "string"],
  "funFacts": ["string", "string"],
  "historicalContext": "string",
  "discussionQuestions": ["string", "string", "string"],
  "presentationFlow": "string"
}

Return ONLY the JSON object, no markdown code fences or additional text.`
}

function sanitizeJsonString(input) {
  let output = ''
  let inString = false
  let escaped = false

  for (const ch of input) {
    if (escaped) {
      output += ch
      escaped = false
      continue
    }

    if (ch === '\\') {
      output += ch
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      output += ch
      continue
    }

    if (inString) {
      const code = ch.charCodeAt(0)
      if (code < 0x20) {
        if (ch === '\n') output += '\\n'
        else if (ch === '\r') output += '\\r'
        else if (ch === '\t') output += '\\t'
        continue
      }
    }

    output += ch
  }

  return output
}

async function generateGuide(imageData, artworkText) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  })

  // Extract base64 data and mime type from data URL
  const matches = imageData.match(/^data:(.+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid image data format')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  }

  const prompt = buildPrompt(artworkText)

  // Retry logic for API calls
  const maxRetries = 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }

      const jsonString = jsonMatch[0]
      let guide
      try {
        guide = JSON.parse(jsonString)
      } catch (parseError) {
        try {
          guide = JSON.parse(sanitizeJsonString(jsonString))
        } catch {
          throw parseError
        }
      }
      return guide
    } catch (error) {
      lastError = error
      console.error(`Attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw lastError
}

router.post('/generate-guide', async (req, res, next) => {
  try {
    const { primaryImage, artworkText } = req.body

    if (!primaryImage) {
      return res.status(400).json({ message: 'Primary image is required' })
    }

    const guide = await generateGuide(primaryImage, artworkText)

    res.json({ guide })
  } catch (error) {
    next(error)
  }
})

export default router
