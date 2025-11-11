import subprocess
import sys
import os

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def compress_video(input_path, output_path, target_size_mb=14.5):
    """
    Compress MP4 video to target size using ffmpeg
    Args:
        input_path: Path to input video file
        output_path: Path to output compressed video
        target_size_mb: Target size in megabytes (default 14.5MB)
    """
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found")
        return False
    
    # Get input file size
    input_size = get_file_size_mb(input_path)
    print(f"Input file size: {input_size:.2f} MB")
    
    # If file is already smaller than target, no need to compress
    if input_size <= target_size_mb:
        print(f"File is already smaller than {target_size_mb}MB. No compression needed.")
        return True
    
    # Get video duration
    duration_cmd = [
        'ffprobe',
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        input_path
    ]
    
    try:
        duration = float(subprocess.check_output(duration_cmd).decode('utf-8').strip())
        print(f"Video duration: {duration:.2f} seconds")
    except Exception as e:
        print(f"Error getting video duration: {e}")
        return False
    
    # Calculate target bitrate (leaving some margin for audio)
    # target_size_mb * 8192 (bits per MB) / duration - audio_bitrate
    audio_bitrate = 128  # 128 kbps for audio
    target_bitrate = int((target_size_mb * 8192) / duration - audio_bitrate)
    
    print(f"Target video bitrate: {target_bitrate} kbps")
    
    # Compress video using ffmpeg
    compress_cmd = [
        'ffmpeg',
        '-i', input_path,
        '-c:v', 'libx264',
        '-b:v', f'{target_bitrate}k',
        '-c:a', 'aac',
        '-b:a', f'{audio_bitrate}k',
        '-preset', 'medium',
        '-movflags', '+faststart',
        '-y',  # Overwrite output file if exists
        output_path
    ]
    
    try:
        print("Compressing video...")
        subprocess.run(compress_cmd, check=True, capture_output=True)
        
        # Check output file size
        output_size = get_file_size_mb(output_path)
        print(f"Output file size: {output_size:.2f} MB")
        print(f"Compression ratio: {(input_size/output_size):.2f}x")
        print("Compression completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error during compression: {e}")
        print(f"FFmpeg output: {e.stderr.decode('utf-8')}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python compress_video.py <input_file> <output_file> [target_size_mb]")
        print("Example: python compress_video.py input.mp4 output.mp4 14.5")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_mb = float(sys.argv[3]) if len(sys.argv) > 3 else 14.5
    
    success = compress_video(input_file, output_file, target_mb)
    sys.exit(0 if success else 1)
