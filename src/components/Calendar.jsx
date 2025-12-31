import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns'
import { getMissionData, calculateDailyScore } from '../services/missionService'
import { missions } from '../data/missions'
import './Calendar.css'

const Calendar = ({ onDateClick, currentMonth, onMonthChange }) => {
  const [missionStatus, setMissionStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonthMissions()
  }, [currentMonth])

  const loadMonthMissions = async () => {
    try {
      setLoading(true)
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      const status = {}
      
      // 각 날짜별로 두 부서의 미션 상태 확인
      for (const day of days) {
        const dateStr = format(day, 'yyyy-MM-dd')
        status[dateStr] = {
          sarang: await getMissionStatus(dateStr, 'sarang'),
          hana: await getMissionStatus(dateStr, 'hana')
        }
      }
      
      setMissionStatus(status)
    } catch (error) {
      console.error('미션 상태 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMissionStatus = async (date, department) => {
    try {
      const data = await getMissionData(date, department)
      if (!data || !data.missions) return { hasMissions: false, count: 0, details: [] }
      
      const missionCount = Object.keys(data.missions).filter(
        key => data.missions[key] > 0
      ).length
      
      // 미션 상세 정보 가져오기
      const details = []
      missions.forEach(mission => {
        const count = data.missions[mission.id] || 0
        if (mission.id === 'meditation-share') {
          // 묵상 공유는 6명 이상이어야 점수
          const members = data.meditationMembers?.[mission.id] || []
          if (members.length >= 6) {
            details.push({ name: mission.name, points: mission.points })
          }
        } else if (mission.type === 'daily') {
          if (count > 0) {
            details.push({ name: mission.name, points: mission.points })
          }
        } else {
          if (count > 0) {
            const points = count * mission.points
            details.push({ name: mission.name, points, count })
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
            >
              <div className="day-number">{format(day, 'd')}</div>
              {(status?.sarangScore > 0 || status?.hanaScore > 0) && (
                <div className="day-scores">
                  {status.sarangScore > 0 && (
                    <div className="day-score sarang-score">
                      <span className="score-label">사랑부</span>
                      <span className="score-value">{status.sarangScore}점</span>
                    </div>
                  )}
                  {status.hanaScore > 0 && (
                    <div className="day-score hana-score">
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

