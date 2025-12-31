import React, { useState, useEffect } from 'react'
import { getAllTimeScores } from '../services/missionService'
import { departments } from '../data/missions'
import Calendar from './Calendar'
import MissionModal from './MissionModal'
import { format } from 'date-fns'
import './MainScreen.css'

const MainScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scores, setScores] = useState({ sarang: 0, hana: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScores()
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
          {departments.map(dept => (
            <div 
              key={dept.id} 
              className={`score-card ${dept.id}`}
            >
              <div className="department-name">{dept.name}</div>
              <div className="score-value">
                {loading ? '...' : scores[dept.id] || 0}
                <span className="score-unit">점</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Calendar
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        onDateClick={(date) => {
          setSelectedDate(date)
          // 날짜 클릭 시 부서 선택 모달 먼저 표시
          setSelectedDepartment(null)
          setIsModalOpen(true)
        }}
      />

      {isModalOpen && selectedDate && (
        <MissionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          date={selectedDate}
          department={selectedDepartment}
          onDepartmentSelect={handleDepartmentSelect}
        />
      )}
    </div>
  )
}

export default MainScreen
