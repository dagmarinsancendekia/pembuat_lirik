import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [lyrics, setLyrics] = useState('')
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [displayedLines, setDisplayedLines] = useState([])
  const [countdown, setCountdown] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)
  const countdownRef = useRef(null)
  const displayRef = useRef(null)

  const processLyrics = (text) => {
    const words = text.split(/\s+/).filter(word => word.trim() !== '')
    const lines = []
    let currentLine = []

    for (const word of words) {
      currentLine.push(word)
      if (currentLine.length >= 15) {
        lines.push(currentLine.join(' '))
        currentLine = []
      }
    }

    // Add remaining words if any
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '))
    }

    return lines
  }

  const lines = processLyrics(lyrics)

  const startCountdown = () => {
    setCountdown(5)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          startScrolling()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startScrolling = () => {
    if (lines.length === 0) return
    setIsPlaying(true)
    setIsFinished(false)
    const interval = 60000 / bpm // milliseconds per beat
    intervalRef.current = setInterval(() => {
      setCurrentLine(prev => {
        const nextLine = (prev + 1) % lines.length
        setDisplayedLines(current => {
          const newDisplayed = [...current]
          if (!newDisplayed.includes(lines[prev])) {
            newDisplayed.push(lines[prev])
          }
          return newDisplayed
        })

        // Check if we've completed a full cycle
        if (nextLine === 0 && prev === lines.length - 1) {
          setIsFinished(true)
          stopScrolling()
        }

        return nextLine
      })
    }, interval)
  }

  const stopScrolling = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      setCountdown(0)
    }
  }

  const resetScrolling = () => {
    stopScrolling()
    setCurrentLine(0)
    setDisplayedLines([])
    setIsFinished(false)
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
          placeholder="Paste your lyrics here... (will be automatically formatted with max 15 words per line)"
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
          <button onClick={isPlaying ? stopScrolling : startCountdown} disabled={countdown > 0}>
            {countdown > 0 ? `Starting in ${countdown}...` : (isPlaying ? 'Pause' : 'Play')}
          </button>
          <button onClick={resetScrolling}>Reset</button>
        </div>
      </div>
      <div className="display" ref={displayRef}>
        {countdown > 0 ? (
          <div className="countdown-display">{countdown}</div>
        ) : lines.length > 0 ? (
          isFinished ? (
            <div className="finished-display">🎉 Selesai! 🎉</div>
          ) : (
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
          )
        ) : (
          <p>Paste your lyrics above and click Play to start!</p>
        )}
      </div>
      <div className="summary">
        <h3>Displayed Lines Summary:</h3>
        <div className="summary-content">
          {displayedLines.length > 0 ? (
            displayedLines.map((line, index) => (
              <div key={index} className="summary-line">
                {line}
              </div>
            ))
          ) : (
            <p>No lines displayed yet. Start playing to see the summary.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
