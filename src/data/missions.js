export const missions = [
  {
    id: 'meditation-share',
    name: '말씀 묵상 공유',
    description: '부서별 일일 4명 이상 공유',
    points: 1,
    unit: '1일',
    type: 'daily'
  },
  {
    id: 'evangelism',
    name: '전도',
    description: '말씀 듣는 사진 촬영',
    points: 5,
    unit: '1인',
    type: 'person',
    hasMemberList: true
  },
  {
    id: 'department-visit',
    name: '부서 심방',
    description: '심방 사진 촬영 (월 2회 제한)',
    points: 5,
    unit: '1인',
    type: 'person',
    monthlyLimit: 2,
    hasMemberList: true
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
    id: 'winter-attendance-2025',
    name: '동계참석',
    description: '2025년 12월 28일 전용',
    points: 1,
    unit: '1인',
    type: 'person',
    hasMemberList: true,
    allowedDate: '2025-12-28'
  },
  {
    id: 'bingo-3',
    name: '빙고미션 (3빙고)',
    description: '2025년 12월 28일 전용',
    points: 3,
    unit: '1인',
    type: 'person',
    hasMemberList: true,
    allowedDate: '2025-12-28'
  },
  {
    id: 'bingo-4',
    name: '빙고미션 (4빙고)',
    description: '2025년 12월 28일 전용',
    points: 4,
    unit: '1인',
    type: 'person',
    hasMemberList: true,
    allowedDate: '2025-12-28'
  },
  {
    id: 'bingo-5',
    name: '빙고미션 (5빙고)',
    description: '2025년 12월 28일 전용',
    points: 5,
    unit: '1인',
    type: 'person',
    hasMemberList: true,
    allowedDate: '2025-12-28'
  }
]

export const departments = [
  { id: 'sarang', name: '사랑부' },
  { id: 'hana', name: '하나부' }
]

