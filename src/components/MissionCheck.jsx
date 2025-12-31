import React, { useState, useEffect } from 'react'
import { missions } from '../data/missions'
import { getMissionData, saveMissionCheck, getMonthlyMissionCount } from '../services/missionService'
import './MissionCheck.css'

const MissionCheck = ({ department, date, onUpdate }) => {
  const [missionCounts, setMissionCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMissionData()
  }, [department, date])

  const loadMissionData = async () => {
    try {
      setLoading(true)
      const data = await getMissionData(date, department)
      if (data && data.missions) {
        setMissionCounts(data.missions)
      } else {
        setMissionCounts({})
      }
    } catch (error) {
      console.error('미션 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCountChange = async (missionId, newCount) => {
    if (newCount < 0) return
    
    // 월 제한 체크
    const mission = missions.find(m => m.id === missionId)
    if (mission && mission.monthlyLimit) {
      try {
        const currentMonthlyCount = await getMonthlyMissionCount(date, department, missionId)
        const currentDayCount = missionCounts[missionId] || 0
        const newMonthlyTotal = currentMonthlyCount - currentDayCount + newCount
        
        if (newMonthlyTotal > mission.monthlyLimit) {
          alert(`${mission.name}은(는) 월 ${mission.monthlyLimit}회로 제한됩니다. (현재: ${currentMonthlyCount - currentDayCount}회)`)
          return
        }
      } catch (error) {
        console.error('월 제한 체크 오류:', error)
        // 오류 발생 시에도 진행 (네트워크 문제 등)
      }
    }

    setSaving(true)
    try {
      await saveMissionCheck(date, department, missionId, newCount)
      setMissionCounts(prev => ({
        ...prev,
        [missionId]: newCount
      }))
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('미션 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const increment = (missionId) => {
    const current = missionCounts[missionId] || 0
    handleCountChange(missionId, current + 1)
  }

  const decrement = (missionId) => {
    const current = missionCounts[missionId] || 0
    handleCountChange(missionId, Math.max(0, current - 1))
  }

  const calculateDailyScore = () => {
    let total = 0
    missions.forEach(mission => {
      const count = missionCounts[mission.id] || 0
      if (mission.type === 'daily') {
        if (count > 0) {
          total += mission.points
        }
      } else {
        total += count * mission.points
      }
    })
    return total
  }

  if (loading) {
    return <div className="loading">로딩 중...</div>
  }

  return (
    <div className="mission-check">
      <div className="mission-header">
        <h3>미션 체크</h3>
        <div className="daily-score">
          오늘 점수: <strong>{calculateDailyScore()}점</strong>
        </div>
      </div>

      {saving && (
        <div className="saving-indicator">저장 중...</div>
      )}

      <div className="missions-list">
        {missions.map(mission => {
          const count = missionCounts[mission.id] || 0
          const score = mission.type === 'daily' 
            ? (count > 0 ? mission.points : 0)
            : count * mission.points

          return (
            <div key={mission.id} className="mission-item">
              <div className="mission-info">
                <div className="mission-name">{mission.name}</div>
                <div className="mission-description">{mission.description}</div>
                {mission.monthlyLimit && (
                  <div className="mission-limit">
                    (월 {mission.monthlyLimit}회 제한)
                  </div>
                )}
              </div>
              
              <div className="mission-controls">
                <div className="count-controls">
                  <button
                    className="btn-decrement"
                    onClick={() => decrement(mission.id)}
                    disabled={count === 0 || saving}
                  >
                    −
                  </button>
                  <div className="count-display">
                    <span className="count-value">{count}</span>
                    <span className="count-unit">{mission.unit}</span>
                  </div>
                  <button
                    className="btn-increment"
                    onClick={() => increment(mission.id)}
                    disabled={saving}
                  >
                    +
                  </button>
                </div>
                <div className="mission-score">
                  {score}점
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mission-footer">
        <p className="certification-note">
          💡 인증: 소통방 공유
        </p>
      </div>
    </div>
  )
}

export default MissionCheck

