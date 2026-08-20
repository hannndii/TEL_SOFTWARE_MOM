import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { createClient as createAdminClient } from '@supabase/supabase-js'


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// In-memory rate limiter (resets on server restart/cold boot, but lightweight)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const MAX_REQUESTS = 3; // Max requests per user per minute
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate Limiting Logic (by user ID)
    const nowTime = Date.now();
    const userRateData = rateLimitMap.get(user.id) || { count: 0, resetTime: nowTime + WINDOW_MS };
    
    if (nowTime > userRateData.resetTime) {
      userRateData.count = 1;
      userRateData.resetTime = nowTime + WINDOW_MS;
    } else {
      userRateData.count += 1;
    }
    
    rateLimitMap.set(user.id, userRateData);

    if (userRateData.count > MAX_REQUESTS) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute before generating again.' }, { status: 429 })
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

    // 2. Validate Quota (Internal Limit based on actual generations today)
    const now = new Date();
    const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    utc7Time.setUTCHours(0, 0, 0, 0);
    const startOfToday = new Date(utc7Time.getTime() - (7 * 60 * 60 * 1000));
    
    const { count: generatedTodayCount } = await supabase
      .from('meeting_mom')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'exported')
      .gte('updated_at', startOfToday.toISOString());

    if ((generatedTodayCount || 0) >= 50) {
      return NextResponse.json({ error: 'You have reached the daily limit (50) for document generation to prevent excessive use. Please try again tomorrow.' }, { status: 403 })
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

Important Rules:
1. "issue": Must accurately and precisely reflect what the speakers conveyed. Only record the important points that are the actual problems or constraints discussed in the meeting. Do not hallucinate.
2. "action_plan": Each action plan must directly refer to or address the specific points mentioned in the "issue". Do not invent action plans that were not discussed; they must be grounded in the provided transcript.

Output the result strictly as a valid JSON object with the following schema:
{
  "issue": ["Array of strings representing the exact, important problem points discussed (Issue/Kendala)"],
  "action_plan": [
    {
      "action": "String describing the action to be taken, directly addressing the issues based only on the discussion",
      "pic": "String representing the Person in Charge",
      "due_date": "String representing the target date (e.g., W4 Februari)"
    }
  ],
  "kesepakatan": ["Array of strings representing the final agreements (Kesepakatan)"]
}
Ensure the language is formal Indonesian. If any section is not mentioned in the transcript, provide an empty array [] instead of null.
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
    
    // Preserve Project Snapshot
    generatedJson.customer_name = momData.content_json.customer_name
    generatedJson.project_name = momData.content_json.project_name
    generatedJson.dasar_penunjukan = momData.content_json.dasar_penunjukan
    generatedJson.link_tomps = momData.content_json.link_tomps
    generatedJson.masa_layanan = momData.content_json.masa_layanan
    generatedJson.scope_of_work = momData.content_json.scope_of_work
    generatedJson.dokumen_project = momData.content_json.dokumen_project
    generatedJson.pic_project = momData.content_json.pic_project

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

    // 6. Quota Decrement Removed (Handled dynamically via count query)

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
