import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  FieldValue,
  onSnapshot
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import { format, isSameDay } from 'date-fns'
import { missions } from '../data/missions'

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd')
}

// 오늘 날짜 가져오기
export const getTodayDate = () => {
  return formatDate(new Date())
}

// 특정 날짜의 미션 체크 데이터 가져오기
export const getMissionData = async (date, department) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return null
    }
    
    const dateStr = typeof date === 'string' ? date : formatDate(date)
    const docRef = doc(db, 'missions', `${dateStr}_${department}`)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('미션 데이터 가져오기 오류:', error)
    throw error
  }
}

// 월의 모든 미션 데이터를 한 번에 가져오기 (배치 쿼리)
export const getMonthMissionData = async (year, month) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return {}
    }
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startStr = formatDate(firstDay)
    const endStr = formatDate(lastDay)
    
    const missionsRef = collection(db, 'missions')
    const q = query(
      missionsRef,
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    )
    
    const querySnapshot = await getDocs(q)
    const monthData = {}
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const dateStr = data.date
      const dept = data.department
      
      if (!monthData[dateStr]) {
        monthData[dateStr] = { sarang: null, hana: null }
      }
      
      monthData[dateStr][dept] = data
    })
    
    return monthData
  } catch (error) {
    console.error('월별 미션 데이터 가져오기 오류:', error)
    throw error
  }
}

// 월의 모든 미션 데이터를 실시간으로 구독 (onSnapshot)
export const subscribeMonthMissionData = (year, month, callback) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {}
  }
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startStr = formatDate(firstDay)
  const endStr = formatDate(lastDay)
  
  const missionsRef = collection(db, 'missions')
  const q = query(
    missionsRef,
    where('date', '>=', startStr),
    where('date', '<=', endStr)
  )
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const monthData = {}
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const dateStr = data.date
      const dept = data.department
      
      if (!monthData[dateStr]) {
        monthData[dateStr] = { sarang: null, hana: null }
      }
      
      monthData[dateStr][dept] = data
    })
    
    callback(monthData)
  }, (error) => {
    console.error('월별 미션 데이터 실시간 구독 오류:', error)
  })
  
  return unsubscribe
}

// 모든 미션 데이터를 실시간으로 구독 (총 점수용)
export const subscribeAllMissionData = (callback) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {}
  }
  
  const missionsRef = collection(db, 'missions')
  
  const unsubscribe = onSnapshot(missionsRef, (querySnapshot) => {
    callback(querySnapshot)
  }, (error) => {
    console.error('전체 미션 데이터 실시간 구독 오류:', error)
  })
  
  return unsubscribe
}

// 특정 날짜의 특정 부서 데이터 삭제
export const deleteDepartmentData = async (date, department) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase 설정이 완료되지 않았습니다.')
    }
    
    const dateStr = typeof date === 'string' ? date : formatDate(date)
    const docId = `${dateStr}_${department}`
    const docRef = doc(db, 'missions', docId)
    
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('부서 데이터 삭제 오류:', error)
    throw error
  }
}

// 미션 체크 저장/업데이트
export const saveMissionCheck = async (date, department, missionId, count, meditationMembers = null) => {
  try {
    // Firebase 설정 확인
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase 설정이 완료되지 않았습니다.\n\nsrc/firebase/config.js 파일에 Firebase 설정 정보를 입력해주세요.\n\n1. Firebase Console에서 프로젝트 생성\n2. Firestore Database 생성\n3. 웹 앱 추가 후 설정 정보 복사\n4. config.js 파일에 입력')
    }
    
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다.')
    }
    
    const dateStr = typeof date === 'string' ? date : formatDate(date)
    const docId = `${dateStr}_${department}`
    const docRef = doc(db, 'missions', docId)
    
    // 기존 데이터 가져오기
    const existingData = await getMissionData(dateStr, department)
    
    // 명단 기반 미션인지 확인
    const mission = missions.find(m => m.id === missionId)
    const isMemberListMission = mission?.hasMemberList || missionId === 'meditation-share'
    
    // existingData가 없으면 새로 생성
    if (!existingData) {
      // 명단 기반 미션이고 멤버가 없으면 문서 생성하지 않음
      if (isMemberListMission) {
        if (!meditationMembers || !meditationMembers[missionId] || meditationMembers[missionId].length === 0) {
          return true
        }
      } else {
        // 일반 미션이고 count가 0이면 문서 생성하지 않음
        if (count === 0) {
          return true
        }
      }
      
      const newData = {
        date: dateStr,
        department,
        missions: isMemberListMission ? {} : (count > 0 ? { [missionId]: count } : {}),
        meditationMembers: meditationMembers !== null ? meditationMembers : {},
        updatedAt: Timestamp.now()
      }
      // 모든 데이터가 비어있으면 문서 생성하지 않음
      if (Object.keys(newData.missions).length === 0 && Object.keys(newData.meditationMembers).length === 0) {
        return true
      }
      await setDoc(docRef, newData)
      return true
    }
    
    const missionData = existingData.missions || {}
    const existingMeditationMembers = existingData.meditationMembers || {}
    
    // 미션 데이터 업데이트 (명단 기반 미션이 아닌 경우만)
    if (!isMemberListMission) {
      if (count === 0) {
        // count가 0이면 해당 미션 삭제
        delete missionData[missionId]
      } else {
        missionData[missionId] = count
      }
    } else {
      // 명단 기반 미션은 missions에서 제거 (혹시 있으면)
      delete missionData[missionId]
    }
    
    // 멤버 데이터 업데이트 (제공된 경우 - 객체 전체를 받음)
    let updatedMeditationMembers
    if (meditationMembers !== null) {
      updatedMeditationMembers = { ...existingMeditationMembers }
      // 명단 기반 미션의 경우
      if (meditationMembers[missionId] !== undefined) {
        if (meditationMembers[missionId].length === 0) {
          // 빈 배열이면 해당 미션 삭제
          delete updatedMeditationMembers[missionId]
        } else {
          updatedMeditationMembers[missionId] = meditationMembers[missionId]
        }
      }
      // 명단 기반 미션이고 meditationMembers에 해당 미션이 없으면 기존 데이터에서도 삭제
      if (isMemberListMission && meditationMembers[missionId] === undefined) {
        delete updatedMeditationMembers[missionId]
      }
    } else {
      updatedMeditationMembers = existingMeditationMembers 
    }
    
    // 모든 미션이 0이거나 없으면 문서 삭제
    const hasAnyMissions = Object.keys(missionData).length > 0 || Object.keys(updatedMeditationMembers).length > 0
    if (!hasAnyMissions) {
      // 문서 삭제
      await deleteDoc(docRef)
      return true
    }
    
    // 문서 저장 (merge: false로 전체 문서 교체하여 삭제된 필드도 제거)
    await setDoc(docRef, {
      date: dateStr,
      department,
      missions: missionData,
      meditationMembers: updatedMeditationMembers,
      updatedAt: Timestamp.now()
    })
    
    return true
  } catch (error) {
    console.error('미션 체크 저장 오류:', error)
    // Firebase 설정이 안 되어 있는 경우 더 명확한 에러 메시지
    if (error.code === 'failed-precondition' || error.message?.includes('permission')) {
      throw new Error('Firestore 보안 규칙을 확인해주세요. 읽기/쓰기 권한이 필요합니다.')
    } else if (error.code === 'unavailable' || error.message?.includes('network')) {
      throw new Error('네트워크 연결을 확인해주세요.')
    } else if (error.message?.includes('YOUR_') || error.message?.includes('Firebase')) {
      throw new Error('Firebase 설정이 완료되지 않았습니다. src/firebase/config.js 파일을 확인해주세요.')
    }
    throw error
  }
}

// 부서별 일일 점수 계산
export const calculateDailyScore = (missionData, missions) => {
  if (!missionData) return 0
  
  let totalScore = 0
  const missionCounts = missionData.missions || {}
  const meditationMembers = missionData.meditationMembers || {}
  const dataDate = missionData.date ? new Date(missionData.date) : null
  
  missions.forEach(mission => {
    // 날짜 제한이 있는 미션은 해당 날짜에만 계산
    if (mission.allowedDate && dataDate) {
      const allowedDate = new Date(mission.allowedDate)
      if (!isSameDay(dataDate, allowedDate)) {
        return
      }
    }
    
    if (mission.id === 'meditation-share') {
      // 묵상 공유는 6명 이상이어야 점수 획득
      const members = meditationMembers[mission.id] || []
      if (members.length >= 6) {
        totalScore += mission.points
      }
    } else if (mission.hasMemberList) {
      // 명단 기반 미션 (전도, 부서 심방, 동계참석 등)
      const members = meditationMembers[mission.id] || []
      const count = members.length
      totalScore += count * mission.points
    } else {
      const count = missionCounts[mission.id] || 0
      if (mission.type === 'daily') {
        // 일일 미션은 1일당 1점
        if (count > 0) {
          totalScore += mission.points
        }
      } else {
        // 인원별 미션은 인원수 * 점수
        totalScore += count * mission.points
      }
    }
  })
  
  return totalScore
}

// 월별 미션 체크 횟수 가져오기
export const getMonthlyMissionCount = async (date, department, missionId) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return 0
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startStr = formatDate(firstDay)
    const endStr = formatDate(lastDay)
    
    const missionsRef = collection(db, 'missions')
    const q = query(
      missionsRef,
      where('date', '>=', startStr),
      where('date', '<=', endStr),
      where('department', '==', department)
    )
    
    const querySnapshot = await getDocs(q)
    let totalCount = 0
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // 명단 기반 미션인 경우
      if (data.meditationMembers && data.meditationMembers[missionId]) {
        const members = data.meditationMembers[missionId]
        // 부서 심방은 날짜별로 1회씩 카운트 (명단 인원수와 무관)
        if (missionId === 'department-visit') {
          if (members.length > 0) {
            totalCount += 1 // 날짜당 1회
          }
        } else {
          // 다른 명단 기반 미션은 멤버 수를 세기
          totalCount += members.length
        }
      } else if (data.missions && data.missions[missionId]) {
        // 기존 방식 (명단 없이 숫자만 저장된 경우)
        totalCount += data.missions[missionId]
      }
    })
    
    return totalCount
  } catch (error) {
    console.error('월별 미션 체크 횟수 가져오기 오류:', error)
    throw error
  }
}

// 부서별 총 점수 가져오기 (기간별)
export const getDepartmentScores = async (startDate, endDate) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return { sarang: 0, hana: 0 }
    }
    
    const startStr = typeof startDate === 'string' ? startDate : formatDate(startDate)
    const endStr = typeof endDate === 'string' ? endDate : formatDate(endDate)
    
    const missionsRef = collection(db, 'missions')
    const q = query(
      missionsRef,
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    )
    
    const querySnapshot = await getDocs(q)
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
    
    return scores
  } catch (error) {
    console.error('부서별 점수 가져오기 오류:', error)
    throw error
  }
}

// 부서별 총 점수 가져오기 (모든 기간)
export const getAllTimeScores = async () => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return { sarang: 0, hana: 0 }
    }
    
    const missionsRef = collection(db, 'missions')
    const querySnapshot = await getDocs(missionsRef)
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
    
    return scores
  } catch (error) {
    console.error('총 점수 가져오기 오류:', error)
    throw error
  }
}

// 월별 점수 가져오기
export const getMonthlyScores = async (year, month) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return { sarang: 0, hana: 0 }
    }
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startStr = formatDate(firstDay)
    const endStr = formatDate(lastDay)
    
    const missionsRef = collection(db, 'missions')
    const q = query(
      missionsRef,
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    )
    
    const querySnapshot = await getDocs(q)
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
    
    return scores
  } catch (error) {
    console.error('월별 점수 가져오기 오류:', error)
    throw error
  }
}

// 월별 미션별 점수 가져오기
export const getMonthlyMissionScores = async (year, month) => {
  try {
    if (!isFirebaseConfigured() || !db) {
      return {
        sarang: {},
        hana: {}
      }
    }
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startStr = formatDate(firstDay)
    const endStr = formatDate(lastDay)
    
    const missionsRef = collection(db, 'missions')
    const q = query(
      missionsRef,
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    )
    
    const querySnapshot = await getDocs(q)
    const missionScores = {
      sarang: {},
      hana: {}
    }
    
    // 각 미션별로 초기화
    missions.forEach(mission => {
      missionScores.sarang[mission.id] = 0
      missionScores.hana[mission.id] = 0
    })
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const dept = data.department
      const missionCounts = data.missions || {}
      const meditationMembers = data.meditationMembers || {}
      
      missions.forEach(mission => {
        let score = 0
        
        if (mission.id === 'meditation-share') {
          const members = meditationMembers[mission.id] || []
          if (members.length >= 6) {
            score = mission.points
          }
        } else if (mission.hasMemberList) {
          const members = meditationMembers[mission.id] || []
          score = members.length * mission.points
        } else {
          const count = missionCounts[mission.id] || 0
          if (mission.type === 'daily') {
            if (count > 0) {
              score = mission.points
            }
          } else {
            score = count * mission.points
          }
        }
        
        missionScores[dept][mission.id] += score
      })
    })
    
    return missionScores
  } catch (error) {
    console.error('월별 미션별 점수 가져오기 오류:', error)
    throw error
  }
}

