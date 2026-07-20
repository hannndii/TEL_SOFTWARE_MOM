import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { momId } = body

    if (!momId) {
      return NextResponse.json({ error: 'MoM ID is required' }, { status: 400 })
    }

    // 1. Fetch Draft and User Profile
    const { data: momData, error: momError } = await supabase
      .from('meeting_mom')
      .select('*')
      .eq('id', momId)
      .eq('user_id', user.id)
      .single()

    if (momError || !momData) {
      return NextResponse.json({ error: 'MoM draft not found' }, { status: 404 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tier, daily_quota_left')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const isPremium = userProfile.tier === 'premium'

    // 2. Validate Quota for Free Tier
    if (!isPremium && userProfile.daily_quota_left <= 0) {
      return NextResponse.json({ error: 'Daily quota exceeded. Please upgrade to Premium.' }, { status: 403 })
    }

    // 3. Download the raw content file from Storage
    const rawFilePath = momData.content_json?.raw_file_path
    if (!rawFilePath) {
      return NextResponse.json({ error: 'Raw file path not found in draft' }, { status: 400 })
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('mom_contents')
      .download(rawFilePath)

    if (downloadError || !fileBlob) {
      return NextResponse.json({ error: 'Failed to download raw file from storage' }, { status: 500 })
    }

    // 4. Generate MoM using Gemini API
    const systemPrompt = `You are a professional corporate secretary assistant. Your task is to extract meeting minutes from the provided document.
Output the result strictly as a valid JSON object with the following schema:
{
  "pembahasan_utama": "String summarizing the main discussion",
  "note_dari_tiap_pihak": ["Array of strings containing notes from participants"],
  "action_plan": ["Array of strings containing the action plans"],
  "informasi_tambahan": "String containing any additional information, or null"
}
Ensure the language is formal Indonesian.
`
    const userPrompt = `
Meeting Topic: ${momData.topic}
Date: ${momData.meeting_date}
Participants: ${momData.participants.join(', ')}

Please analyze the attached meeting transcript document.
`

    // Convert blob to base64 for inline data
    const arrayBuffer = await fileBlob.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [
            { text: systemPrompt + userPrompt },
            { inlineData: { data: base64Data, mimeType: fileBlob.type || 'text/plain' } }
          ] 
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    const resultText = response.text
    if (!resultText) {
      throw new Error("AI returned empty response")
    }

    const generatedJson = JSON.parse(resultText)

    // Preserve the location from the original draft
    generatedJson.location = momData.content_json.location

    // 5. Update Database (Update content_json, status, and AI model)
    const { error: updateError } = await supabase
      .from('meeting_mom')
      .update({
        content_json: generatedJson,
        ai_model_used: 'gemini-2.0-flash',
        status: 'exported', // we use 'exported' or 'completed' to signify it's done
        updated_at: new Date().toISOString()
      })
      .eq('id', momId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update MoM record' }, { status: 500 })
    }

    // 6. Decrement Quota (if free tier)
    if (!isPremium) {
      await supabase
        .from('users')
        .update({ daily_quota_left: userProfile.daily_quota_left - 1 })
        .eq('id', user.id)
    }

    // 7. Delete Raw File from Storage
    await supabase.storage
      .from('mom_contents')
      .remove([rawFilePath])

    return NextResponse.json({ success: true, id: momId })
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
