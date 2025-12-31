// 부서별 명단
// 형제(b): brother, 자매(s): sister
// 오름차순 정렬됨
const sarangBrothers = [
  '김현준',
  '홍우린',
  '윤중근',
  '박근홍',
  '홍승진',
  '유준하',
  '박설민',
  '윤대근'
].sort()

const sarangSisters = [
  '지예슬',
  '조은채',
  '김지현',
  '지보은',
  '박서희',
  '권소희',
  '김나영',
  '송채은',
  '김설',
  '김지애',
  '이채민',
  '조아라',
  '한유하',
  '김민주',
  '박진영'
].sort()

const hanaBrothers = [
  '박지훈',
  '김준영',
  '유원열',
  '윤소망',
  '진민수',
  '박진환',
  '김주연',
  '함누리',
  '최민성'
].sort()

const hanaSisters = [
  '이예은',
  '김정이',
  '김행미',
  '박채은',
  '최수아',
  '구자윤',
  '정민주',
  '박소정',
  '김단아',
  '강리원',
  '백예림',
  '강민서',
  '김민지',
  '엄선형',
  '우나경'
].sort()

export const departmentMembers = {
  sarang: {
    brothers: sarangBrothers,
    sisters: sarangSisters
  },
  hana: {
    brothers: hanaBrothers,
    sisters: hanaSisters
  }
}

// 하위 호환성을 위한 배열 형태도 제공
export const getDepartmentMembersArray = (department) => {
  const dept = departmentMembers[department]
  if (!dept) return []
  return [...dept.brothers, ...dept.sisters]
}

