
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel


app = FastAPI(
    title="CliniScribe Speech API",
    description="Speech-to-text API for the CliniScribe demo",
    version="1.0.0",
)

# Allow the local Vite frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the speech recognition model.
# The first startup may take time to download the model.
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8",
)

ALLOWED_EXTENSIONS = {
    ".webm",
    ".wav",
    ".mp3",
    ".m4a",
    ".mp4",
    ".ogg",
    ".mpeg",
    ".mpga",
    ".flac",
}

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB


@app.get("/")
async def root():
    return {
        "message": "CliniScribe Speech API is running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    filename = audio.filename or "recording.webm"
    extension = Path(filename).suffix.lower()

    # Browsers can label WebM recordings as video/webm.
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio file extension: {extension or 'none'}",
        )

    temp_path = None

    try:
        # Read the upload and enforce a size limit.
        content = await audio.read(MAX_UPLOAD_BYTES + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded audio file is empty.",
            )

        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="File is too large. Maximum upload size is 25 MB.",
            )

        # Preserve the file extension so the decoder can identify the format.
        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=extension,
            delete=False,
        ) as temp:
            temp.write(content)
            temp_path = temp.name

        # Run speech recognition.
        segments, info = model.transcribe(
            temp_path,
            beam_size=3,
        )

        # Consume the segments to produce the complete transcript.
        transcript = " ".join(
            segment.text.strip() for segment in segments
        ).strip()

        return {
            "language": info.language,
            "transcript": transcript,
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Transcription error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail=(
                "Transcription failed. Check the backend terminal "
                "for details and verify that the audio format is supported."
            ),
        ) from exc

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError as cleanup_error:
                print(f"Temporary file cleanup failed: {cleanup_error}")

        await audio.close()
