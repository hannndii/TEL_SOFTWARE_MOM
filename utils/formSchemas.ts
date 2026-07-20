import { z } from "zod";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Step 1: Metadata
export const metadataSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(100),
  meeting_date: z.string().min(1, "Meeting date is required"),
  location: z.string().min(2, "Location or Meeting Link is required"),
  attendees: z.string().min(2, "Attendees are required"),
});

export type MetadataFormValues = z.infer<typeof metadataSchema>;

// Step 2: Audio/Transcript
// This schema will just validate that a file exists.
// We handle the tier-based format restrictions manually in the UI dropzone or via custom logic
export const contentSchema = z.object({
  contentFile: z
    .any()
    .refine((file) => file !== undefined && file !== null, "Audio or Transcript file is required."),
});

export type ContentFormValues = {
  contentFile: File | null;
};

// Step 3: Evidence Photo
export const evidenceSchema = z.object({
  evidenceFile: z
    .any()
    .refine((file) => file !== undefined && file !== null, "Evidence photo is required.")
    .refine(
      (file) => (file?.size || 0) <= MAX_FILE_SIZE,
      "Max image size is 3MB."
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, and .png formats are supported."
    ),
});

export type EvidenceFormValues = {
  evidenceFile: File | null;
};
