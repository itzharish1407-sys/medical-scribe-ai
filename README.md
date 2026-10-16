# CliniScribe --- Medical Speech-to-Text for Hospitals

CliniScribe is a prototype application designed to help healthcare
professionals convert recorded clinical speech into editable text. The
project combines a web frontend with a Python speech-to-text API powered
by Faster-Whisper.

> **Important:** This is an educational/demo project, not a certified
> medical device or a replacement for clinical review. Always have a
> qualified healthcare professional verify transcripts before using them
> in patient care. Do not upload real patient information to a public
> demo unless you have appropriate authorization, privacy safeguards,
> and consent.

## Features

-   Web interface for the medical speech-to-text workflow
-   Audio upload to the backend for transcription
-   Speech recognition powered by Faster-Whisper
-   Editable transcription workflow (where supported by the frontend)
-   FastAPI backend with API documentation
-   Frontend and backend can be deployed separately

> Feature availability depends on the current implementation in the
> repository. Do not assume patient records, authentication, database
> persistence, or automatic recording controls are implemented unless
> they are present in the code.

## Technology Stack

### Frontend

-   React
-   Vite
-   JavaScript / CSS (and any UI libraries included in the project)

### Backend

-   Python
-   FastAPI
-   Faster-Whisper
-   Uvicorn

## Project Structure

The repository may be organized like this. Adjust names to match the
actual files in your checkout.

``` text
medical-scribe-ai/
├── frontend/          # React + Vite web application
├── backend/            # FastAPI speech-to-text service (if separated)
│   ├── app.py
│   └── requirements.txt
└── README.md
```

If `app.py` or `requirements.txt` is located somewhere else, use its
actual path when running the commands below.

## Requirements

-   Git
-   Node.js and npm
-   Python 3.10 or a version supported by the installed Faster-Whisper
    dependencies
-   Internet access for installing dependencies and downloading the
    speech model on first use

## Run the Frontend Locally

Open a terminal in the repository root:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your browser (commonly
`http://localhost:5173`).

To create a production build:

``` bash
npm run build
```

The generated frontend files are normally placed in `frontend/dist/`.

## Run the Backend Locally

Open a second terminal and navigate to the directory containing the
FastAPI `app.py` file.

Create and activate a virtual environment (Linux / Parrot OS):

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies. If the backend has a
`requirements.txt` file:

``` bash
pip install -r requirements.txt
```

If your backend file is named `app.py` and defines `app = FastAPI(...)`,
start the API with:

``` bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

If the module is inside a package or a different folder, change
`app:app` to the correct Python module path. Open
`http://127.0.0.1:8000/docs` to view the FastAPI interactive API
documentation.

### Speech Model Notes

Faster-Whisper may download model files on first use. Model loading and
transcription can consume significant RAM, CPU, disk space, and startup
time. Choose a model size appropriate for your machine and deployment
environment.

## Frontend--Backend Configuration

The frontend must send audio requests to the backend's base URL. During
local development, this may be a URL such as:

``` text
http://127.0.0.1:8000
```

For deployment, configure the frontend to use the public HTTPS URL of
the deployed backend. If the frontend uses Vite environment variables, a
variable such as `VITE_API_BASE_URL` can be used **only after the
frontend code has been updated to read that variable**.

Example `.env` entry:

``` env
VITE_API_BASE_URL=https://your-backend.example.com
```

Replace the example URL with your actual backend URL. Do not put secrets
in Vite environment variables: values prefixed with `VITE_` are exposed
to the browser.

The FastAPI backend must allow requests from the deployed frontend
domain through its CORS configuration. Add only the origins you trust;
do not rely on a wildcard CORS policy for sensitive deployments.

## Deployment

### Frontend on Vercel

1.  Push the project to GitHub.
2.  In Vercel, choose **Add New → Project** and import the repository.
3.  If the React application is inside `frontend/`, set **Root
    Directory** to `frontend`.
4.  Select **Vite** as the framework preset.
5.  Use the build command `npm run build`.
6.  Use `dist` as the output directory.
7.  Add the frontend environment variable for the backend URL if the
    code is configured to use one.
8.  Deploy and test the public site.

### Backend

The FastAPI service needs a Python-compatible host that supports the
required dependencies and model resources. Deploy it separately, then
update the frontend's API base URL and the backend's CORS allowlist.

A successful frontend deployment alone does not mean that speech
transcription is available online. Verify the backend health/API
endpoint and test an audio upload after connecting both services.

## API

The backend is built with FastAPI. When it is running locally, visit:

-   Interactive API docs: `http://127.0.0.1:8000/docs`
-   OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

The exact endpoint paths and accepted audio formats depend on the
current backend implementation. Check the API docs or backend source
before integrating another client.

## Troubleshooting

-   **Frontend build fails:** Run `npm install` and `npm run build`
    inside `frontend/`. Read the first meaningful error in the Vercel
    build log.
-   **Browser cannot reach the API:** Confirm the backend is running,
    the API URL is correct, and CORS allows the frontend origin.
-   **Transcription fails:** Check backend logs, accepted audio
    format/size, available memory, model download status, and host
    timeouts.
-   **Deployment works but transcription does not:** Confirm the backend
    has also been deployed and the frontend is not still pointing to
    `localhost`.
-   **Model startup is slow:** The model may need to download on first
    start; check the hosting provider's disk, memory, CPU, and
    request-time limits.

## Privacy and Responsible Use

-   Use synthetic or non-identifying sample audio for demonstrations.
-   Do not include patient names, medical records, API keys, passwords,
    or other secrets in the repository.
-   Add `.env` files and local model/cache files to `.gitignore` as
    appropriate.
-   Obtain proper authorization and consent before processing real
    patient recordings.
-   Review and correct all generated text; speech recognition can
    mishear names, medications, dosages, and clinical terms.
-   Apply suitable access controls, encryption, retention rules, and
    applicable privacy/legal requirements before any real clinical use.

## Contributing

1.  Create a branch for your change.
2.  Make and test your changes locally.
3.  Commit your work with a clear message.
4.  Push the branch and open a pull request.

## License

No license has been specified yet. Add a `LICENSE` file before granting
others permission to reuse, modify, or distribute this project.

------------------------------------------------------------------------

**CliniScribe** --- a medical speech-to-text prototype for exploring
speech recognition in clinical workflows.
