import { z } from "zod";

// Step 1: Metadata
export const metadataSchema = z.object({
  agenda: z.string().min(3, "Agenda must be at least 3 characters").max(100),
  meeting_date: z.string().min(1, "Meeting date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(2, "Location or Venue is required"),
  type_of_meeting: z.array(z.string()).min(1, "Please select at least one meeting type"),
  attendees: z.string().min(2, "Attendees are required"),
  facilitator: z.string().min(2, "Facilitator name is required"),
});

export type MetadataFormValues = z.infer<typeof metadataSchema>;

// Step 2: Content (Transcript)
export const contentSchema = z.object({
  contentFiles: z.any()
    .refine((files) => files && files.length >= 1, "Please upload at least one transcript file")
    .refine((files) => files && files.length <= 5, "You can upload a maximum of 5 files")
    .refine(
      (files) => {
        if (!files) return false;
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 20 * 1024 * 1024) return false;
        }
        return true;
      },
      "Each file size must be less than 20MB"
    )
    .refine(
      (files) => {
        if (!files) return false;
        for (let i = 0; i < files.length; i++) {
          const type = files[i].type || '';
          const name = files[i].name.toLowerCase();
          
          const isText = type.includes('text') || type.includes('word') || type.includes('pdf') || name.endsWith('.txt') || name.endsWith('.docx');
          const isAudio = type.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a');
          
          if (!isText && !isAudio) {
             return false;
          }
        }
        return true;
      },
      "Only .txt, .docx, and audio files (.mp3, .wav, .m4a) are supported"
    ),
});
