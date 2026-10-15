
import { useState, useRef, useEffect } from 'react'
import {
  Activity, AudioLines, Bell, CalendarDays, Check,
  ChevronDown, ClipboardList, Clock3, FileText,
  LayoutDashboard, Mic, Pause, Play, Plus,
  Search, Settings, ShieldCheck, Square, Stethoscope,
  UserRound, Users, Waves
} from 'lucide-react'
import './App.css'

const initialPatients = [
  { id: 'PT-2041', name: 'Aarav Sharma', age: 42, reason: 'Persistent cough', time: '09:30 AM', status: 'In consultation', initials: 'AS', color: 'mint' },
  { id: 'PT-2042', name: 'Meera Reddy', age: 35, reason: 'Routine follow-up', time: '10:00 AM', status: 'Waiting', initials: 'MR', color: 'lavender' },
  { id: 'PT-2043', name: 'Rahul Verma', age: 58, reason: 'Blood pressure review', time: '10:30 AM', status: 'Waiting', initials: 'RV', color: 'peach' },
]

export default function App() {
  const [patientList, setPatientList] = useState(initialPatients)
  const [selected, setSelected] = useState(initialPatients[0])
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [notes, setNotes] = useState('')
  const [approved, setApproved] = useState(false)
  const [search, setSearch] = useState('')
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientReason, setPatientReason] = useState('')
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioUrlRef = useRef(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [recordingError, setRecordingError] = useState('')
  const patients = patientList.filter(patient =>
  `${patient.name} ${patient.id} ${patient.reason}`
    .toLowerCase()
    .includes(search.toLowerCase())
)


  async function startRecording() {
    try {
      setRecordingError('')

      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        setRecordingError('Audio recording is not supported in this browser. Try a recent version of Chrome or Firefox.')
        return
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }

      setAudioUrl('')
      setTranscript('')
      setNotes('')
      setApproved(false)
      setFinished(false)
      setPaused(false)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob)
          audioUrlRef.current = url
          setAudioUrl(url)
        }
        stream.getTracks().forEach(track => track.stop())
        if (streamRef.current === stream) streamRef.current = null
      }

      recorder.start()
      setRecording(true)
    } catch (error) {
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      setRecording(false)
      setPaused(false)
      setRecordingError(
        error?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Allow microphone access in your browser and try again.'
          : `Could not start recording: ${error?.message || 'Unknown error'}`
      )
    }
  }

  function togglePause() {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      recorder.pause()
      setPaused(true)
    } else if (recorder.state === 'paused') {
      recorder.resume()
      setPaused(false)
    }
  }

  function finishRecording() {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recorder.state !== 'inactive') recorder.stop()
    setRecording(false)
    setPaused(false)
    setFinished(true)
  }

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null
        recorder.stop()
      }
      streamRef.current?.getTracks().forEach(track => track.stop())
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [])

  function addPatient(event) {
    event.preventDefault()
    if (!patientName.trim()) return
    const patient = {
      id: `PT-${2044 + Math.floor(Math.random() * 500)}`,
      name: patientName.trim(),
      age: '—',
      reason: patientReason.trim() || 'Reason not entered',
      time: 'New',
      status: 'Waiting',
      initials: patientName.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      color: 'mint',
    }
    setPatientList(previous => [...previous, patient])
    setSelected(patient)
    setSearch('')
    setPatientName('')
    setPatientReason('')
    setShowPatientForm(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Activity size={23} /></div>
          <div><strong>VOXMED AI</strong><span>AI CLINICAL ASSISTANT</span></div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
          <button className="nav-item" onClick={() => document.getElementById('patients')?.scrollIntoView({ behavior: 'smooth' })}><Users size={18} /> Patients</button>
          <button className="nav-item" onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}><Stethoscope size={18} /> Consultation</button>
          <button className="nav-item" onClick={() => document.getElementById('clinical-notes')?.scrollIntoView({ behavior: 'smooth' })}><FileText size={18} /> Clinical notes</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card"><ShieldCheck size={20} /><div><strong>Privacy first</strong><p>Clinical drafts require doctor review.</p></div></div>
          <button className="nav-item"><Settings size={18} /> Settings</button>
          <div className="doctor-profile"><div className="doctor-avatar">DR</div><div><strong>Dr. Demo</strong><span>General physician</span></div><ChevronDown size={16} /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="top-actions"><span className="system-status"><i /> All systems ready</span><button className="icon-button" aria-label="Notifications"><Bell size={19} /></button><div className="top-avatar">DR</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow">THURSDAY, OCTOBER 15</div><h1>Good morning, Doctor <span>✳</span></h1><p>Here’s your clinical workspace for today.</p></div>
            <button className="primary-button" onClick={() => setShowPatientForm(!showPatientForm)}><Plus size={18} /> New patient</button>
          </section>

          {showPatientForm && <form className="patient-form" onSubmit={addPatient}><h3>Add demo patient</h3><input placeholder="Patient name" value={patientName} onChange={e => setPatientName(e.target.value)} required /><input placeholder="Reason for visit" value={patientReason} onChange={e => setPatientReason(e.target.value)} /><button className="primary-button" type="submit">Add patient</button></form>}

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon teal"><Users size={19} /></div><span>Today's patients</span><strong>18</strong><small><b>+3</b> compared with yesterday</small></div>
            <div className="stat-card"><div className="stat-icon violet"><ClipboardList size={19} /></div><span>Notes to review</span><strong>{finished && !approved ? 1 : 4}</strong><small>Require physician approval</small></div>
            <div className="stat-card"><div className="stat-icon blue"><Clock3 size={19} /></div><span>Time saved</span><strong>1.8 <em>hrs</em></strong><small>Estimated this week</small></div>
            <div className="stat-card"><div className="stat-icon amber"><AudioLines size={19} /></div><span>Transcription status</span><strong className="status-word">Ready</strong><small>Demo interface · no audio uploaded</small></div>
          </section>

          <section className="section-heading" id="patients"><div><h2>Patient queue</h2><p>Choose a patient to open their consultation.</p></div><button className="text-button" onClick={() => setShowPatientForm(true)}>View / add patients <span>→</span></button></section>

          <div className="patient-layout">
            <section className="panel patient-panel">
              <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." /></div>
              <div className="patient-list">{patients.map(patient => <button key={patient.id} className={`patient-row ${selected.id === patient.id ? 'selected' : ''}`} onClick={() => {setSelected(patient); setFinished(false); setApproved(false); setTranscript(''); setNotes('')}}><div className={`patient-avatar ${patient.color}`}>{patient.initials}</div><div className="patient-info"><strong>{patient.name}</strong><span>{patient.id} · {patient.age} years</span><small>{patient.reason}</small></div><div className="patient-time">{patient.time}<span className={patient.status === 'Waiting' ? 'waiting' : 'in-progress'}>{patient.status}</span></div></button>)}
              {patients.length === 0 && <p className="empty-state">No matching patients.</p>}</div>
              <div className="panel-foot"><Users size={15} /> {patients.length} demo patients shown</div>
            </section>

            <section className="panel consultation-panel" id="consultation">
              <div className="panel-title"><div><span className="eyebrow">ACTIVE ENCOUNTER</span><h2>Consultation room</h2></div><span className="live-badge"><i /> {finished ? 'Finished' : recording ? paused ? 'Paused' : 'Recording' : 'Ready'}</span></div>
              <div className="encounter-person"><div className={`patient-avatar large ${selected.color}`}>{selected.initials}</div><div><h3>{selected.name}</h3><p>{selected.id} · {selected.age} years · {selected.reason}</p></div><button className="icon-button" title="Patient details"><UserRound size={18} /></button></div>
              <div className={`recording-visual ${recording && !paused ? 'is-recording' : ''}`}><div className="wave-icon"><Waves size={26} /></div><div><strong>{finished ? 'Session completed' : recording ? paused ? 'Recording paused' : 'Listening to consultation' : 'Ready to begin'}</strong><span>{finished ? 'This session is closed. Start a new session to record again.' : recording ? paused ? 'Continue when ready' : 'Audio capture is not connected yet' : 'Start a session when the patient is ready.'}</span></div><div className="wave-bars">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{height: `${8 + ((i * 13 + 7) % 24)}px`}} />)}</div></div>
              <div className="record-controls">
                {!recording && !finished && <button className="primary-button record-start" onClick={startRecording}><Mic size={17} /> Start recording</button>}
                {recording && !paused && <button className="secondary-button" onClick={togglePause}><Pause size={16} /> Pause</button>}
                {recording && paused && <button className="primary-button" onClick={togglePause}><Play size={16} /> Continue</button>}
                {recording && <button className="danger-button" onClick={finishRecording}><Square size={14} /> Finish visit</button>}
                {finished && <button className="primary-button" onClick={startRecording}><Mic size={17} /> New recording session</button>}
                {!recording && !finished && <span className="consent-note">Confirm patient consent before recording.</span>}
              </div>
              {recordingError && <p role="alert" className="disclaimer">{recordingError}</p>}
              {audioUrl && (
                <div className="panel" style={{ padding: 16, marginTop: 16 }}>
                  <h3>Recorded consultation audio</h3>
                  <audio controls src={audioUrl} style={{ width: '100%' }} />
                  <p className="disclaimer">
                    Temporary local recording. It has not been uploaded to a server.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = audioUrl
                      link.download = `cliniscribe-recording-${Date.now()}.webm`
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                    }}
                  >
                    Download Recording
                  </button>
                </div>
              )}
              <div className="transcript-header"><h3><AudioLines size={17} /> Transcript</h3><span>{recording && !paused ? '● Demo session' : 'Draft'}</span></div>
              <textarea className="transcript-area" value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={recording ? 'Audio is being recorded locally. Speech-to-text is not connected yet.' : 'Transcript will appear here after speech recognition is connected. You can also type a demo transcript.'} />
              <p className="disclaimer">Local recording demo only: audio is captured in this browser but is not transcribed or uploaded.</p>
            </section>
          </div>

          <section className="panel notes-panel" id="clinical-notes">
            <div className="panel-title"><div><span className="eyebrow">CLINICAL DOCUMENTATION</span><h2>Clinical note draft</h2></div><span className={`review-badge ${approved ? 'approved' : ''}`}>{approved ? 'Approved' : 'Awaiting review'}</span></div>
            <div className="note-warning"><ShieldCheck size={18} /><span><strong>Physician review required.</strong> This draft is not a diagnosis or prescription. Verify all details before approval.</span></div>
            <label className="field-label" htmlFor="note-editor">Consultation summary / draft notes</label>
            <textarea id="note-editor" className="notes-editor" value={notes} onChange={e => {setNotes(e.target.value); setApproved(false)}} placeholder="Enter or review clinical notes here. Only include information confirmed during the consultation." />
            <div className="notes-footer"><span>{notes.trim() ? notes.trim().split(/\s+/).length : 0} words · Editable draft</span><button className="primary-button" disabled={!finished || !notes.trim()} onClick={() => setApproved(true)}><Check size={17} /> Approve note</button></div>
            {!finished && <p className="disclaimer">Finish the visit before approving the note.</p>}
          </section>
          <footer className="footer-note"><ShieldCheck size={15} /> Secure clinical workspace concept <span>•</span> Demo data only <span>•</span> Not connected to a medical record system</footer>
        </div>
      </main>
    </div>
  )
}
