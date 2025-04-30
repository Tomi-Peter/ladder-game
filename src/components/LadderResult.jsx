import React from 'react'

const LadderResult = ({ current, results }) => {
  if (current === null) return null
  return (
    <div style={{ marginTop: 20 }}>
      <h3>🎯 결과: {results[current]}</h3>
    </div>
  )
}

export default LadderResult

