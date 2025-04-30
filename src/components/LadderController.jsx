import React from 'react'

const LadderController = ({ players, onStart, onReset, onStartAll }) => {
  return (
    <div style={{ margin: '10px 0' }}>
      {players.map((name, idx) => (
        <button key={idx} onClick={() => onStart(idx)} style={{ marginRight: 8 }}>
          {name} 출발
        </button>
      ))}
      <button onClick={onStartAll} style={{ marginRight: 8 }}>
        전체 자동 출발
      </button>
      <button onClick={onReset}>사다리 다시 만들기</button>
    </div>
  )
}

export default LadderController

