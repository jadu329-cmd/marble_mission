export const missions = [
  {
    id: 'evangelism',
    name: '전도',
    description: '말씀 듣는 사진 촬영',
    points: 5,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'department-visit',
    name: '부서 심방',
    description: '심방 사진 촬영 (월 2회 제한)',
    points: 5,
    unit: '1인',
    type: 'person',
    monthlyLimit: 2
  },
  {
    id: 'testimony',
    name: '간증 자원',
    description: '청년회 교제 시 자원',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'meditation-share',
    name: '말씀 묵상 공유',
    description: '부서별 일일 6명 이상 공유',
    points: 1,
    unit: '1일',
    type: 'daily'
  },
  {
    id: 'sunday-meditation',
    name: '주일 묵상모임',
    description: '교제 참석 (중고등부 교사 오후 교제 인도 시 교제 사진 촬영)',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'zoom-meditation',
    name: '줌 묵상모임',
    description: '모임 후 사진 촬영 - 구역모임 참석 시 사진 인증',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'wednesday-sermon',
    name: '수요말씀 참석',
    description: '말씀 후 사진 촬영',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'youth-fellowship',
    name: '청년회 교제',
    description: '18:50 사진 촬영',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'service',
    name: '집회 참석',
    description: '말씀 후 사진 촬영',
    points: 1,
    unit: '1인',
    type: 'person'
  },
  {
    id: 'winter-attendance',
    name: '동계 참석',
    description: '단체 사진 촬영',
    points: 1,
    unit: '1인',
    type: 'person'
  }
]

export const departments = [
  { id: 'sarang', name: '사랑부' },
  { id: 'hana', name: '하나부' }
]

