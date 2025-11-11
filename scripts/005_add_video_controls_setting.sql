-- Add column to control whether video controls are visible to viewers
ALTER TABLE screens
ADD COLUMN IF NOT EXISTS show_video_controls BOOLEAN DEFAULT true;
