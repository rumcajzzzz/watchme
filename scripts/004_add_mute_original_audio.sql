-- Add column to track if original video audio should be muted
ALTER TABLE screens
ADD COLUMN mute_original_audio BOOLEAN DEFAULT FALSE;
