import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths, parseISO } from 'date-fns'
import { getMissionData, calculateDailyScore, deleteDepartmentData, getMonthMissionData, subscribeMonthMissionData } from '../services/missionService'
import { missions } from '../data/missions'
import './Calendar.css'

const Calendar = ({ onDateClick, currentMonth, onMonthChange, onRefresh }) => {
  const [missionStatus, setMissionStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // 실시간 구독 설정
    const unsubscribe = subscribeMonthMissionData(year, month, (monthData) => {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      // 모든 날짜의 상태 계산
      const status = {}
      days.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const sarangData = monthData[dateStr]?.sarang || null
        const hanaData = monthData[dateStr]?.hana || null
        
        status[dateStr] = {
          sarang: calculateMissionStatus(sarangData, day),
          hana: calculateMissionStatus(hanaData, day)
        }
      })
      
      setMissionStatus(status)
      setLoading(false)
    })
    
    // cleanup: 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe()
    }
  }, [currentMonth])

  const loadMonthMissions = async () => {
    try {
      setLoading(true)
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      // 배치 쿼리로 월의 모든 데이터를 한 번에 가져오기
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const monthData = await getMonthMissionData(year, month)
      
      // 모든 날짜의 상태 계산 (동기 함수이므로 Promise.all 불필요)
      const status = {}
      days.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const sarangData = monthData[dateStr]?.sarang || null
        const hanaData = monthData[dateStr]?.hana || null
        
        status[dateStr] = {
          sarang: calculateMissionStatus(sarangData, day),
          hana: calculateMissionStatus(hanaData, day)
        }
      })
      
      setMissionStatus(status)
    } catch (error) {
      console.error('미션 상태 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 미션 상태 계산 (동기 함수로 변경)
  const calculateMissionStatus = (data, date) => {
    if (!data) return { hasMissions: false, count: 0, details: [], totalScore: 0 }
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    let missionCount = 0
    const details = []
    
    missions.forEach(mission => {
      // 날짜 제한이 있는 미션은 해당 날짜에만 체크
      if (mission.allowedDate) {
        const allowedDate = parseISO(mission.allowedDate)
        if (!isSameDay(dateObj, allowedDate)) {
          return
        }
      }
      
      if (mission.id === 'meditation-share') {
        const members = data.meditationMembers?.[mission.id] || []
        if (members.length >= 6) {
          missionCount++
          details.push({ name: mission.name, points: mission.points })
        }
      } else if (mission.hasMemberList) {
        const members = data.meditationMembers?.[mission.id] || []
        if (members.length > 0) {
          missionCount++
          const points = members.length * mission.points
          details.push({ name: mission.name, points, count: members.length })
        }
      } else {
        const count = data.missions?.[mission.id] || 0
        if (count > 0) {
          missionCount++
          if (mission.type === 'daily') {
            details.push({ name: mission.name, points: mission.points })
          } else {
            const points = count * mission.points
            details.push({ name: mission.name, points, count })
          }
        }
      }
    })
    
    return {
      hasMissions: missionCount > 0,
      count: missionCount,
      details,
      totalScore: calculateDailyScore(data, missions)
    }
  }

  const getMissionStatus = async (date, department) => {
    try {
      const data = await getMissionData(date, department)
      if (!data) return { hasMissions: false, count: 0, details: [] }
      
      // 미션이 있는지 확인 (missions와 meditationMembers 모두 체크)
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      let missionCount = 0
      missions.forEach(mission => {
        // 날짜 제한이 있는 미션은 해당 날짜에만 체크
        if (mission.allowedDate) {
          const allowedDate = parseISO(mission.allowedDate)
          if (!isSameDay(dateObj, allowedDate)) {
            return
          }
        }
        
        if (mission.id === 'meditation-share') {
          const members = data.meditationMembers?.[mission.id] || []
          if (members.length >= 6) {
            missionCount++
          }
        } else if (mission.hasMemberList) {
          const members = data.meditationMembers?.[mission.id] || []
          if (members.length > 0) {
            missionCount++
          }
        } else {
          const count = data.missions[mission.id] || 0
          if (count > 0) {
            missionCount++
          }
        }
      })
      
      // 미션 상세 정보 가져오기
      const details = []
      missions.forEach(mission => {
        // 날짜 제한이 있는 미션은 해당 날짜에만 체크
        if (mission.allowedDate) {
          const allowedDate = parseISO(mission.allowedDate)
          if (!isSameDay(dateObj, allowedDate)) {
            return
          }
        }
        
        if (mission.id === 'meditation-share') {
          // 묵상 공유는 6명 이상이어야 점수
          const members = data.meditationMembers?.[mission.id] || []
          if (members.length >= 6) {
            details.push({ name: mission.name, points: mission.points })
          }
        } else if (mission.hasMemberList) {
          // 명단 기반 미션 (전도, 부서 심방 등)
          const members = data.meditationMembers?.[mission.id] || []
          if (members.length > 0) {
            const points = members.length * mission.points
            details.push({ name: mission.name, points, count: members.length })
          }
        } else {
          const count = data.missions[mission.id] || 0
          if (mission.type === 'daily') {
            if (count > 0) {
              details.push({ name: mission.name, points: mission.points })
            }
          } else {
            if (count > 0) {
              const points = count * mission.points
              details.push({ name: mission.name, points, count })
            }
          }
        }
      })
      
      return {
        hasMissions: missionCount > 0,
        count: missionCount,
        details,
        totalScore: calculateDailyScore(data, missions)
      }
    } catch (error) {
      return { hasMissions: false, count: 0, details: [] }
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // 달력 시작 전 빈 칸
  const startDay = getDay(monthStart)
  const emptyDays = Array(startDay).fill(null)
  
  // 요일 헤더
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1))
  }

  const handleDeleteDepartment = async (date, department, departmentName) => {
    if (!window.confirm(`${format(date, 'yyyy년 MM월 dd일')} ${departmentName} 데이터를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deleteDepartmentData(date, department)
      // 캘린더 새로고침
      await loadMonthMissions()
      // 부모 컴포넌트에 새로고침 알림
      if (onRefresh) {
        onRefresh()
      }
      alert(`${departmentName} 데이터가 삭제되었습니다.`)
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const getDayStatus = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const status = missionStatus[dateStr]
    if (!status) return null
    
    const sarangCount = status.sarang?.count || 0
    const hanaCount = status.hana?.count || 0
    
    return {
      sarang: sarangCount > 0,
      hana: hanaCount > 0,
      total: sarangCount + hanaCount,
      sarangDetails: status.sarang?.details || [],
      hanaDetails: status.hana?.details || [],
      sarangScore: status.sarang?.totalScore || 0,
      hanaScore: status.hana?.totalScore || 0
    }
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          ‹
        </button>
        <h2 className="calendar-month">
          {format(currentMonth, 'yyyy년 MM월')}
        </h2>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}
        
        {days.map(day => {
          const status = getDayStatus(day)
          const isToday = isSameDay(day, new Date())
          const dateStr = format(day, 'yyyy-MM-dd')
          
          // 툴팁 내용 생성
          const tooltipContent = status && status.total > 0 ? (
            <div className="day-tooltip-content">
              {status.sarangDetails && status.sarangDetails.length > 0 && (
                <div className="tooltip-department">
                  <div className="tooltip-dept-name sarang">사랑부</div>
                  {status.sarangDetails.map((detail, idx) => (
                    <div key={idx} className="tooltip-mission">
                      {detail.name} {detail.count ? `(${detail.count}명) ` : ''}{detail.points}점
                    </div>
                  ))}
                  <div className="tooltip-total">총 {status.sarangScore}점</div>
                </div>
              )}
              {status.hanaDetails && status.hanaDetails.length > 0 && (
                <div className="tooltip-department">
                  <div className="tooltip-dept-name hana">하나부</div>
                  {status.hanaDetails.map((detail, idx) => (
                    <div key={idx} className="tooltip-mission">
                      {detail.name} {detail.count ? `(${detail.count}명) ` : ''}{detail.points}점
                    </div>
                  ))}
                  <div className="tooltip-total">총 {status.hanaScore}점</div>
                </div>
              )}
            </div>
          ) : null
          
          return (
            <div
              key={dateStr}
              className={`calendar-day ${isToday ? 'today' : ''} ${status?.total > 0 ? 'has-missions' : ''}`}
              onClick={() => onDateClick(day)}
              onTouchStart={(e) => {
                // 모바일에서 터치 시 툴팁 표시 (모달 열기 전에)
                if (window.innerWidth <= 768 && status && status.total > 0) {
                  e.stopPropagation()
                  e.preventDefault()
                  const dayElement = e.currentTarget
                  const tooltip = dayElement.querySelector('.day-tooltip')
                  if (tooltip) {
                    // 다른 툴팁 숨기기
                    document.querySelectorAll('.day-tooltip').forEach(t => {
                      if (t !== tooltip) t.classList.remove('show')
                    })
                    tooltip.classList.toggle('show')
                  }
                }
              }}
            >
              <div className="day-number">{format(day, 'd')}</div>
              {(status?.sarangScore > 0 || status?.hanaScore > 0) && (
                <div className="day-scores">
                  {status.sarangScore > 0 && (
                    <div 
                      className="day-score sarang-score"
                      onContextMenu={(e) => {
                        // 모바일에서는 우클릭 기능 비활성화
                        if (window.innerWidth <= 768) {
                          return
                        }
                        e.preventDefault()
                        handleDeleteDepartment(day, 'sarang', '사랑부')
                      }}
                      title={window.innerWidth > 768 ? "우클릭하여 삭제" : ""}
                    >
                      <span className="score-label">사랑부</span>
                      <span className="score-value">{status.sarangScore}점</span>
                    </div>
                  )}
                  {status.hanaScore > 0 && (
                    <div 
                      className="day-score hana-score"
                      onContextMenu={(e) => {
                        // 모바일에서는 우클릭 기능 비활성화
                        if (window.innerWidth <= 768) {
                          return
                        }
                        e.preventDefault()
                        handleDeleteDepartment(day, 'hana', '하나부')
                      }}
                      title={window.innerWidth > 768 ? "우클릭하여 삭제" : ""}
                    >
                      <span className="score-label">하나부</span>
                      <span className="score-value">{status.hanaScore}점</span>
                    </div>
                  )}
                </div>
              )}
              {status && status.total > 0 && (
                <>
                  <div className="day-status">
                    {status.sarangDetails && status.sarangDetails.length > 0 && (
                      <span className="status-dot sarang-dot"></span>
                    )}
                    {status.hanaDetails && status.hanaDetails.length > 0 && (
                      <span className="status-dot hana-dot"></span>
                    )}
                  </div>
                  {tooltipContent && (
                    <div className="day-tooltip">
                      {tooltipContent}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

