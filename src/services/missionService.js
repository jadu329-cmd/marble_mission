import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import { format } from 'date-fns'
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
    const missionData = existingData?.missions || {}
    const existingMeditationMembers = existingData?.meditationMembers || {}
    
    // 미션 데이터 업데이트
    missionData[missionId] = count
    
    // 묵상 멤버 데이터 업데이트 (제공된 경우)
    const updatedMeditationMembers = meditationMembers !== null 
      ? { ...existingMeditationMembers, [missionId]: meditationMembers }
      : existingMeditationMembers
    
    // 문서 저장
    await setDoc(docRef, {
      date: dateStr,
      department,
      missions: missionData,
      meditationMembers: updatedMeditationMembers,
      updatedAt: Timestamp.now()
    }, { merge: true })
    
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
  if (!missionData || !missionData.missions) return 0
  
  let totalScore = 0
  const missionCounts = missionData.missions
  const meditationMembers = missionData.meditationMembers || {}
  
  missions.forEach(mission => {
    if (mission.id === 'meditation-share') {
      // 묵상 공유는 6명 이상이어야 점수 획득
      const members = meditationMembers[mission.id] || []
      if (members.length >= 6) {
        totalScore += mission.points
      }
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
      if (data.missions && data.missions[missionId]) {
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

