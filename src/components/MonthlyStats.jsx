import React, { useState, useEffect } from 'react'
import { getMonthlyScores, getMonthlyMissionScores } from '../services/missionService'
import { missions, departments } from '../data/missions'
import { format } from 'date-fns'
import './MonthlyStats.css'

const MonthlyStats = ({ currentMonth, onMonthChange }) => {
  const [monthlyScores, setMonthlyScores] = useState({ sarang: 0, hana: 0 })
  const [missionScores, setMissionScores] = useState({ sarang: {}, hana: {} })
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadMonthlyStats()
  }, [currentMonth])

  const loadMonthlyStats = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      
      const [scores, missionData] = await Promise.all([
        getMonthlyScores(year, month),
        getMonthlyMissionScores(year, month)
      ])
      
      setMonthlyScores(scores)
      setMissionScores(missionData)
    } catch (error) {
      console.error('월별 통계 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    onMonthChange(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    onMonthChange(newMonth)
  }

  const getWinner = () => {
    if (monthlyScores.sarang > monthlyScores.hana) return 'sarang'
    if (monthlyScores.hana > monthlyScores.sarang) return 'hana'
    return 'tie'
  }

  const winner = getWinner()

  return (
    <div className="monthly-stats">
      <div className="stats-header">
        <button className="month-nav-btn" onClick={handlePrevMonth}>‹</button>
        <h2>{format(currentMonth, 'yyyy년 MM월')} 통계</h2>
        <button className="month-nav-btn" onClick={handleNextMonth}>›</button>
      </div>

      <div className="monthly-scores-container">
        {departments.map(dept => {
          const score = loading ? '...' : monthlyScores[dept.id] || 0
          const isWinner = winner === dept.id
          const isTie = winner === 'tie'
          
          return (
            <div 
              key={dept.id} 
              className={`monthly-score-card ${dept.id} ${isWinner ? 'winner' : ''} ${isTie ? 'tie' : ''}`}
            >
              <div className="department-name">{dept.name}</div>
              <div className="score-value">
                {score}
                <span className="score-unit">점</span>
              </div>
              {isWinner && <div className="winner-badge">🏆</div>}
              {isTie && <div className="tie-badge">무승부</div>}
            </div>
          )
        })}
      </div>

      <button 
        className="toggle-details-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ 상세 통계 접기' : '▶ 상세 통계 보기'}
      </button>

      {showDetails && (
        <div className="mission-details">
          <h3>미션별 점수</h3>
          <div className="mission-scores-table">
            <div className="table-header">
              <div className="mission-name-col">미션</div>
              <div className="score-col">사랑부</div>
              <div className="score-col">하나부</div>
              <div className="diff-col">차이</div>
            </div>
            {missions.map(mission => {
              const sarangScore = missionScores.sarang[mission.id] || 0
              const hanaScore = missionScores.hana[mission.id] || 0
              const diff = sarangScore - hanaScore
              
              return (
                <div key={mission.id} className="table-row">
                  <div className="mission-name-col">{mission.name}</div>
                  <div className={`score-col ${sarangScore > hanaScore ? 'leading' : ''}`}>
                    {sarangScore}점
                  </div>
                  <div className={`score-col ${hanaScore > sarangScore ? 'leading' : ''}`}>
                    {hanaScore}점
                  </div>
                  <div className={`diff-col ${diff > 0 ? 'sarang-lead' : diff < 0 ? 'hana-lead' : ''}`}>
                    {diff > 0 ? `+${diff}` : diff < 0 ? diff : '0'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyStats

