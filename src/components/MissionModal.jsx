import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { missions } from '../data/missions'
import { departmentMembers } from '../data/members'
import { getMissionData, saveMissionCheck, getMonthlyMissionCount } from '../services/missionService'
import './MissionModal.css'

const MissionModal = ({ isOpen, onClose, date, department: propDepartment, onDepartmentSelect }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(propDepartment)
  const [missionCounts, setMissionCounts] = useState({})
  const [meditationMembers, setMeditationMembers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeMission, setActiveMission] = useState(null)

  useEffect(() => {
    setSelectedDepartment(propDepartment)
  }, [propDepartment])

  useEffect(() => {
    if (isOpen && date && selectedDepartment) {
      loadMissionData()
    }
  }, [isOpen, date, selectedDepartment])

  const loadMissionData = async () => {
    try {
      setLoading(true)
      const data = await getMissionData(date, selectedDepartment)
      if (data && data.missions) {
        setMissionCounts(data.missions)
      } else {
        setMissionCounts({})
      }
      
      // 묵상 공유 멤버 데이터 로드
      if (data && data.meditationMembers) {
        setMeditationMembers(data.meditationMembers)
      } else {
        setMeditationMembers({})
      }
    } catch (error) {
      console.error('미션 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCountChange = async (missionId, newCount) => {
    if (newCount < 0) return
    
    const mission = missions.find(m => m.id === missionId)
    if (mission && mission.monthlyLimit) {
      try {
        const currentMonthlyCount = await getMonthlyMissionCount(date, selectedDepartment, missionId)
        const currentDayCount = missionCounts[missionId] || 0
        const newMonthlyTotal = currentMonthlyCount - currentDayCount + newCount
        
        if (newMonthlyTotal > mission.monthlyLimit) {
          alert(`${mission.name}은(는) 월 ${mission.monthlyLimit}회로 제한됩니다.`)
          return
        }
      } catch (error) {
        console.error('월 제한 체크 오류:', error)
      }
    }

    setSaving(true)
    try {
      await saveMissionCheck(date, selectedDepartment, missionId, newCount)
      setMissionCounts(prev => ({
        ...prev,
        [missionId]: newCount
      }))
    } catch (error) {
      console.error('미션 저장 오류:', error)
      const errorMessage = error.message || '알 수 없는 오류'
      alert(`저장 중 오류가 발생했습니다.\n\n오류 내용: ${errorMessage}\n\nFirebase 설정을 확인해주세요.`)
    } finally {
      setSaving(false)
    }
  }

  const handleMeditationToggle = async (memberName) => {
    const missionId = 'meditation-share'
    const currentMembers = meditationMembers[missionId] || []
    const isChecked = currentMembers.includes(memberName)
    
    let newMembers
    if (isChecked) {
      newMembers = currentMembers.filter(m => m !== memberName)
    } else {
      newMembers = [...currentMembers, memberName]
    }
    
    setMeditationMembers(prev => ({
      ...prev,
      [missionId]: newMembers
    }))
    
    // 6명 이상이면 1점, 아니면 0점
    const newCount = newMembers.length >= 6 ? 1 : 0
    
    setSaving(true)
    try {
      await saveMissionCheck(date, selectedDepartment, 'meditation-share', newCount, newMembers)
      
      setMissionCounts(prev => ({
        ...prev,
        'meditation-share': newCount
      }))
    } catch (error) {
      console.error('묵상 저장 오류:', error)
      const errorMessage = error.message || '알 수 없는 오류'
      alert(`저장 중 오류가 발생했습니다.\n\n오류 내용: ${errorMessage}\n\nFirebase 설정을 확인해주세요.`)
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
      if (mission.id === 'meditation-share') {
        // 묵상 공유는 6명 이상이어야 점수 획득
        const members = meditationMembers[mission.id] || []
        if (members.length >= 6) {
          total += mission.points
        }
      } else if (mission.type === 'daily') {
        if (count > 0) {
          total += mission.points
        }
      } else {
        total += count * mission.points
      }
    })
    return total
  }

  if (!isOpen) return null

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept)
    if (onDepartmentSelect) {
      onDepartmentSelect(dept)
    }
  }

  // 부서 선택이 안 되어 있으면 부서 선택 화면 표시
  if (!selectedDepartment) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{format(date, 'yyyy년 MM월 dd일')}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="department-selection">
            <h3>부서를 선택하세요</h3>
            <div className="department-buttons">
              <button
                className="dept-btn sarang"
                onClick={() => handleDepartmentChange('sarang')}
              >
                사랑부
              </button>
              <button
                className="dept-btn hana"
                onClick={() => handleDepartmentChange('hana')}
              >
                하나부
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const members = departmentMembers[selectedDepartment] || []
  const meditationCheckedMembers = meditationMembers['meditation-share'] || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {format(date, 'yyyy년 MM월 dd일')} - {selectedDepartment === 'sarang' ? '사랑부' : '하나부'}
          </h2>
          <div className="header-actions">
            <button
              className="btn-change-dept"
              onClick={() => setSelectedDepartment(null)}
            >
              부서 변경
            </button>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>

        {saving && (
          <div className="saving-indicator">저장 중...</div>
        )}

        <div className="modal-body">
          <div className="daily-score-display">
            오늘 점수: <strong>{calculateDailyScore()}점</strong>
          </div>

          <div className="missions-list">
            {missions.map(mission => {
              if (mission.id === 'meditation-share') {
                // 묵상 공유는 특별 처리
                return (
                  <div key={mission.id} className="mission-item meditation-item">
                    <div className="mission-info">
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-description">{mission.description}</div>
                      <div className="meditation-status">
                        현재: {meditationCheckedMembers.length}명 / 필요: 6명 이상
                        {meditationCheckedMembers.length >= 6 && (
                          <span className="status-success"> ✓ 달성</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="meditation-members">
                      <div className="members-grid">
                        {members.map(member => {
                          const isChecked = meditationCheckedMembers.includes(member)
                          return (
                            <button
                              key={member}
                              className={`member-checkbox ${isChecked ? 'checked' : ''}`}
                              onClick={() => handleMeditationToggle(member)}
                              disabled={saving}
                            >
                              {member}
                              {isChecked && <span className="check-mark">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="mission-score">
                      {meditationCheckedMembers.length >= 6 ? mission.points : 0}점
                    </div>
                  </div>
                )
              }

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
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

export default MissionModal

