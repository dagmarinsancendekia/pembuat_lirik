import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [lyrics, setLyrics] = useState('')
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const intervalRef = useRef(null)
  const displayRef = useRef(null)

  const processLyrics = (text) => {
    const words = text.split(/\s+/).filter(word => word.trim() !== '')
    const lines = []
    for (let i = 0; i < words.length; i += 10) {
      lines.push(words.slice(i, i + 10).join(' '))
    }
    return lines
  }

  const lines = processLyrics(lyrics)

  const startScrolling = () => {
    if (lines.length === 0) return
    setIsPlaying(true)
    const interval = 60000 / bpm // milliseconds per beat
    intervalRef.current = setInterval(() => {
      setCurrentLine(prev => (prev + 1) % lines.length)
    }, interval)
  }

  const stopScrolling = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resetScrolling = () => {
    stopScrolling()
    setCurrentLine(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="app">
      <h1>Lyric Scroller</h1>
      <div className="controls">
        <textarea
          placeholder="Paste your lyrics here... (will be automatically formatted to 10 words per line)"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={10}
          cols={50}
        />
        <div className="bpm-control">
          <label>BPM: {bpm}</label>
          <input
            type="range"
            min="1"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
        </div>
        <div className="buttons">
          <button onClick={isPlaying ? stopScrolling : startScrolling}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={resetScrolling}>Reset</button>
        </div>
      </div>
      <div className="display" ref={displayRef}>
        {lines.length > 0 && (
          <>
            <div className="current-line">
              {lines[currentLine]}
            </div>
            {currentLine + 1 < lines.length && (
              <div className="next-line">
                {lines[currentLine + 1]}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
