import React, { useState, useEffect } from 'react'
import { getAllTimeScores, subscribeAllMissionData, calculateDailyScore } from '../services/missionService'
import { departments, missions } from '../data/missions'
import Calendar from './Calendar'
import MissionModal from './MissionModal'
import MonthlyStats from './MonthlyStats'
import { format } from 'date-fns'
import './MainScreen.css'

const MainScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scores, setScores] = useState({ sarang: 0, hana: 0 })
  const [loading, setLoading] = useState(true)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)

  useEffect(() => {
    // 실시간 구독 설정
    const unsubscribe = subscribeAllMissionData((querySnapshot) => {
      const scores = { sarang: 0, hana: 0 }
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const score = calculateDailyScore(data, missions)
        if (data.department === 'sarang') {
          scores.sarang += score
        } else if (data.department === 'hana') {
          scores.hana += score
        }
      })
      
      setScores(scores)
      setLoading(false)
    })
    
    // 초기 로드
    loadScores()
    
    // cleanup: 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe()
    }
  }, [])

  const loadScores = async () => {
    try {
      setLoading(true)
      // 모든 기간의 총 점수 계산
      const departmentScores = await getAllTimeScores()
      setScores(departmentScores)
    } catch (error) {
      console.error('점수 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
    setSelectedDepartment(null)
    loadScores() // 점수 새로고침
    // 캘린더 새로고침
    setCalendarRefreshKey(prev => prev + 1)
  }

  const handleMissionSave = () => {
    // 미션 저장 후 캘린더와 점수 새로고침
    loadScores()
    setCalendarRefreshKey(prev => prev + 1)
  }

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth)
  }

  return (
    <div className="main-screen">
      <header className="header">
        <h1>청년회 부서대항전</h1>
        <p className="subtitle">모두의마블</p>
      </header>

      <div className="score-board">
        <h2>부서별 총 점수</h2>
        <div className="scores-container">
          {departments.map(dept => {
            const sarangScore = scores.sarang || 0
            const hanaScore = scores.hana || 0
            let winner = null
            let isTie = false
            
            if (!loading) {
              if (sarangScore > hanaScore) {
                winner = 'sarang'
              } else if (hanaScore > sarangScore) {
                winner = 'hana'
              } else if (sarangScore === hanaScore && sarangScore > 0) {
                isTie = true
              }
            }
            
            const isWinner = winner === dept.id
            
            return (
              <div 
                key={dept.id} 
                className={`score-card ${dept.id} ${isWinner ? 'winner' : ''} ${isTie ? 'tie' : ''}`}
              >
                <div className="department-name">{dept.name}</div>
                <div className="score-value">
                  {loading ? '...' : scores[dept.id] || 0}
                  <span className="score-unit">점</span>
                </div>
                {isWinner && <div className="winner-badge">🏆</div>}
                {isTie && <div className="tie-badge">무승부</div>}
              </div>
            )
          })}
        </div>
      </div>

      <Calendar
        key={calendarRefreshKey}
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        onDateClick={(date) => {
          setSelectedDate(date)
          // 날짜 클릭 시 부서 선택 모달 먼저 표시
          setSelectedDepartment(null)
          setIsModalOpen(true)
        }}
        onRefresh={() => {
          loadScores()
          setCalendarRefreshKey(prev => prev + 1)
        }}
      />

      <MonthlyStats 
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
      />

      {isModalOpen && selectedDate && (
        <MissionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          date={selectedDate}
          department={selectedDepartment}
          onDepartmentSelect={handleDepartmentSelect}
          onSave={handleMissionSave}
        />
      )}
    </div>
  )
}

export default MainScreen
