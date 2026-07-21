import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { createClient as createAdminClient } from '@supabase/supabase-js'


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

    // 3. Download ALL raw content files from Storage
    // Fallback to raw_file_path if raw_file_paths doesn't exist (for older drafts)
    const rawFilePaths: string[] = momData.content_json?.raw_file_paths || 
      (momData.content_json?.raw_file_path ? [momData.content_json.raw_file_path] : [])
      
    if (rawFilePaths.length === 0) {
      return NextResponse.json({ error: 'Raw file paths not found in draft' }, { status: 400 })
    }

    const downloadedFiles = []
    
    for (const filePath of rawFilePaths) {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('mom_contents')
        .download(filePath)

      if (downloadError || !fileBlob) {
        return NextResponse.json({ error: `Failed to download raw file: ${filePath}` }, { status: 500 })
      }
      
      const arrayBuffer = await fileBlob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const fileName = filePath.toLowerCase()
      
      if (fileName.endsWith('.docx') || fileBlob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text using mammoth
        try {
          const mammoth = (await import('mammoth')).default
          const result = await mammoth.extractRawText({ buffer })
          const text = result.value
          
          downloadedFiles.push({
            type: 'text',
            text: text,
            name: filePath
          })
        } catch(e) {
          console.error("Mammoth error", e)
          return NextResponse.json({ error: 'Failed to extract text from .docx' }, { status: 500 })
        }
      } else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.m4a') || fileBlob.type.startsWith('audio/')) {
        // Audio
        let mimeType = fileBlob.type
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (fileName.endsWith('.wav')) mimeType = 'audio/wav'
          else if (fileName.endsWith('.m4a')) mimeType = 'audio/mp4'
          else mimeType = 'audio/mp3'
        }
        
        downloadedFiles.push({
          type: 'inlineData',
          base64Data: buffer.toString('base64'),
          mimeType: mimeType
        })
      } else {
        // Assume text file
        downloadedFiles.push({
          type: 'inlineData',
          base64Data: buffer.toString('base64'),
          mimeType: 'text/plain'
        })
      }
    }

    // 4. Generate MoM using Gemini API
    const systemPrompt = `You are a professional corporate secretary assistant for Telkom Indonesia. Your task is to extract meeting minutes from the provided document(s) and format it strictly matching this template. If multiple documents are provided, treat them as parts of a single continuous meeting.
Output the result strictly as a valid JSON object with the following schema:
{
  "dasar_pembahasan": ["Array of strings representing the main topics discussed (Dasar Pembahasan)"],
  "notes": [
    {
      "nama_pihak": "String representing the name of the speaker/party",
      "informasi": ["Array of strings containing the points/information they delivered"]
    }
  ],
  "action_plan": [
    {
      "pic": "String representing the Person in Charge",
      "action": "String describing the action to be taken"
    }
  ],
  "informasi_tambahan": {
    "keputusan_final": "String summarizing the final decision",
    "kendala": "String summarizing any obstacles mentioned",
    "risiko": "String summarizing any risks mentioned",
    "menunggu_keputusan": "String summarizing things still pending decision"
  }
}
Ensure the language is formal Indonesian. If any section is not mentioned in the transcript, provide an empty array [] or "-" instead of null.
`
    const userPrompt = `
Meeting Topic: ${momData.topic}
Date: ${momData.meeting_date}
Participants: ${momData.participants.join(', ')}

Please analyze the attached meeting transcript document(s).
`

    // Build parts array
    const parts: any[] = [
      { text: systemPrompt + userPrompt }
    ]
    
    // Append all parts
    for (const file of downloadedFiles) {
      if (file.type === 'text') {
        parts.push({
          text: `\n\n--- Document Transcript ---\n${file.text}`
        })
      } else if (file.type === 'inlineData') {
        parts.push({
          inlineData: { data: file.base64Data, mimeType: file.mimeType }
        })
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { role: 'user', parts }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    let resultText = response.text
    if (!resultText) {
      throw new Error("AI returned empty response")
    }

    // Strip markdown formatting if AI returns ```json ... ```
    resultText = resultText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const generatedJson = JSON.parse(resultText)

    // Preserve the location & time from the original draft
    generatedJson.location = momData.content_json.location
    generatedJson.time = momData.content_json.time
    generatedJson.type_of_meeting = momData.content_json.type_of_meeting

    // 5. Update Database (Update content_json, status, and AI model)
    const { error: updateError } = await supabase
      .from('meeting_mom')
      .update({
        content_json: generatedJson,
        ai_model_used: 'gemini-flash-latest',
        status: 'exported', 
        updated_at: new Date().toISOString()
      })
      .eq('id', momId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update MoM record' }, { status: 500 })
    }

    // 6. Decrement Quota (if free tier)
    if (!isPremium) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        await supabaseAdmin
          .from('users')
          .update({ daily_quota_left: userProfile.daily_quota_left - 1 })
          .eq('id', user.id)
      } else {
         console.error("SUPABASE_SERVICE_ROLE_KEY not found. Quota not decremented.");
      }
    }

    // 7. Delete Raw Files from Storage
    if (rawFilePaths.length > 0) {
      await supabase.storage
        .from('mom_contents')
        .remove(rawFilePaths)
    }

    return NextResponse.json({ success: true, id: momId })
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
