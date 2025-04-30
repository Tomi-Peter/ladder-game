import React, { useState } from 'react'
import LadderCanvas from './LadderCanvas'
import generateLadder from '../utils/ladderGenerator'
import LADDER_CONFIG from '../config/ladderConfig'
import '../styles/ladder.css'


const FIXED_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
  '#f58231', '#911eb4', '#46f0f0', '#f032e6',
  '#bcf60c', '#fabebe', '#008080', '#e6beff',
  '#9a6324', '#fffac8', '#800000', '#aaffc3',
]

const DEFAULT_NAMES = ['A', 'B', 'C', 'D']
const DEFAULT_RESULTS = ['🍕','꽝', '집', '🎉']

const LadderGame = () => {
  const [nameInputs, setNameInputs] = useState(DEFAULT_NAMES)
  const [resultInputs, setResultInputs] = useState(DEFAULT_RESULTS)
  const [ladder, setLadder] = useState(generateLadder(DEFAULT_NAMES.length, 20))
  const [finalResults, setFinalResults] = useState([])
  const [movingPlayers, setMovingPlayers] = useState([])
  const [colors, setColors] = useState(FIXED_COLORS.slice(0, DEFAULT_NAMES.length))
  const [theme, setTheme] = useState('light')
  const [speed, setSpeed] = useState(4)

  const handleNameChange = (index, value) => {
    const newNames = [...nameInputs]
    newNames[index] = value
    setNameInputs(newNames)
  }

  const handleResultChange = (index, value) => {
    const newResults = [...resultInputs]
    newResults[index] = value
    setResultInputs(newResults)
  }

  const handleAddPlayer = () => {
    setNameInputs(prev => [...prev, `참가자${prev.length + 1}`])
    setResultInputs(prev => [...prev, `결과${prev.length + 1}`])
    setColors(prev => [...prev, FIXED_COLORS[prev.length % FIXED_COLORS.length]])
  }

  const handleRemoveLastPlayer = () => {
    if (nameInputs.length <= 1) return
    setNameInputs(prev => prev.slice(0, -1))
    setResultInputs(prev => prev.slice(0, -1))
    setColors(prev => prev.slice(0, -1))
  }

  const handleStartSingle = (idx) => {
    if (finalResults.some(r => r.name === nameInputs[idx])) return
    setMovingPlayers(prev => [...prev, { index: idx, done: false }])
  }

  const handleStartAll = () => {
    const remaining = nameInputs
      .map((_, i) => ({ index: i }))
      .filter(({ index }) => !finalResults.some(r => r.name === nameInputs[index]))
    setMovingPlayers(prev => [...prev, ...remaining])
  }

  const handleFinish = (index, col) => {
    setFinalResults(prev => {
      if (prev.some(r => r.name === nameInputs[index])) return prev
      return [...prev, { name: nameInputs[index], resultCol: col }]
    })
  }

  const handleReset = () => {
    setLadder(generateLadder(nameInputs.length, 20))
    setFinalResults([])
    setMovingPlayers([])
    setColors(FIXED_COLORS.slice(0, nameInputs.length))
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleSpeedChange = (delta) => {
    setSpeed((prev) => Math.max(1, Math.min(20, prev + delta)))
  }

  const textColor = theme === 'light' ? '#000' : '#fff'
  const bgColor = theme === 'light' ? '#fff' : '#000'
  const inputStyle = {
    width: 100,
    height: 36,
    marginRight: 8,
    padding: '0 8px',
    border: theme === 'light' ? '1px solid #ccc' : '1px solid #555',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 14,
    color: textColor,
    backgroundColor: theme === 'light' ? '#fff' : '#222'
  }

  const smallButtonStyle = {
    width: 40,
    height: 32,
    fontSize: 18,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }

  const smallWideButtonStyle = {
    width: 100,
    height: 32,
    fontSize: 14,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', paddingBottom: 40 }}>
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 10,
          backgroundColor: theme === 'light' ? '#000' : '#fff',
          color: theme === 'light' ? '#fff' : '#000',
          border: 'none',
          borderRadius: 20,
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        🌓 테마 전환
      </button>

      <h1 style={{ textAlign: 'center' }}>🎲 사다리 게임</h1>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 10 }}>
            {nameInputs.map((name, idx) => (
              <button
                key={`start-${idx}`}
                onClick={() => handleStartSingle(idx)}
                style={{
                  width: 100,
                  marginRight: 8,
                  marginBottom: 6,
                  backgroundColor: colors[idx],
                  color: theme === 'dark' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                {name} 출발
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            {nameInputs.map((name, idx) => (
              <input
                key={`name-${idx}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                style={inputStyle}
              />
            ))}
          </div>

          <LadderCanvas
            players={nameInputs}
            results={resultInputs}
            ladder={ladder}
            movingPlayers={movingPlayers}
            onFinish={handleFinish}
            colors={colors}
            theme={theme}
            speed={speed}
          />

          <div style={{ marginTop: 10 }}>
            {resultInputs.map((res, idx) => (
              <input
                key={`result-${idx}`}
                type="text"
                value={res}
                onChange={(e) => handleResultChange(idx, e.target.value)}
                style={inputStyle}
              />
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 40, marginTop: LADDER_CONFIG.PADDING + 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button onClick={handleStartAll} style={smallWideButtonStyle}>전체출발</button>
            <button onClick={handleReset} style={smallWideButtonStyle}>사다리생성</button>

            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>참가자 조절</div>
              <button onClick={handleAddPlayer} style={smallButtonStyle}>+</button>
              <button onClick={handleRemoveLastPlayer} style={{ ...smallButtonStyle, marginLeft: 6 }}>-</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>속도 조절</div>
              <button onClick={() => handleSpeedChange(1)} style={smallButtonStyle}>+</button>
              <button onClick={() => handleSpeedChange(-1)} style={{ ...smallButtonStyle, marginLeft: 6 }}>-</button>
              <div style={{ marginTop: 4, fontSize: 12 }}>현재: {speed}</div>
            </div>

            <div style={{ marginTop: 20 }}>
              {finalResults.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 6, fontSize: 16 }}>
                  {item.name} ➡ {resultInputs[item.resultCol]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LadderGame
