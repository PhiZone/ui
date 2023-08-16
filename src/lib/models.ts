export interface UserDto {
  avatar: null | string;
  biography: null | string;
  dateFollowed: Date | null;
  dateJoined: Date;
  dateLastLoggedIn: Date | null;
  dateOfBirth: Date | null;
  experience: number;
  followeeCount: number;
  followerCount: number;
  gender: number;
  id: number;
  language: string;
  region: string;
  rks: number;
  role: null | string;
  tag: null | string;
  userName: string;
}

export interface UserDetailedDto {
  avatar: null | string;
  biography: null | string;
  dateFollowed: Date | null;
  dateJoined: Date;
  dateLastLoggedIn: Date | null;
  dateOfBirth: Date | null;
  email: null | string;
  emailConfirmed: boolean;
  experience: number;
  followeeCount: number;
  followerCount: number;
  gender: number;
  id: number;
  language: null | string;
  notifications: number;
  phoneNumber: null | string;
  phoneNumberConfirmed: boolean;
  region: null | string;
  rks: number;
  role: null | string;
  tag: null | string;
  twoFactorEnabled: boolean;
  userName: null | string;
}

export interface ChapterDto {
  accessibility: number;
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
  description: null | string;
  id: string;
  illustration: null | string;
  illustrator: null | string;
  isHidden: boolean;
  isLocked: boolean;
  likeCount: number;
  ownerId: number;
  subtitle: null | string;
  title: null | string;
}

export interface SongDto {
  accessibility: number;
  authorName: string;
  bpm: number;
  chartLevels: ChartLevelDto[] | null;
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
  description: null | string;
  duration: string;
  edition: null | string;
  editionType: number;
  file: string;
  id: string;
  illustration: string;
  illustrator: string;
  isHidden: boolean;
  isLocked: boolean;
  isOriginal: boolean;
  license: null | string;
  likeCount: number;
  lyrics: null | string;
  maxBpm: number;
  minBpm: number;
  offset: number;
  ownerId: number;
  previewEnd: string;
  previewStart: string;
  title: null | string;
}

export interface SongAdmitteeDto {
  accessibility: number;
  authorName: string;
  bpm: number;
  chartLevels: ChartLevelDto[] | null;
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
  description: null | string;
  duration: string;
  edition: null | string;
  editionType: number;
  file: null | string;
  id: string;
  illustration: string;
  illustrator: string;
  isHidden: boolean;
  isLocked: boolean;
  isOriginal: boolean;
  label: null | string;
  license: null | string;
  likeCount: number;
  lyrics: null | string;
  maxBpm: number;
  minBpm: number;
  offset: number;
  ownerId: number;
  previewEnd: string;
  previewStart: string;
  title: null | string;
}

export interface AdmissionDto<T, R> {
  admittee: T;
  admitter: R;
  dateCreated: Date;
  label: null | string;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface ChartDto {
  accessibility: number;
  authorName: null | string;
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
  description: null | string;
  difficulty: number;
  file: null | string;
  format: number;
  id: string;
  illustration: null | string;
  illustrator: null | string;
  isHidden: boolean;
  isLocked: boolean;
  isRanked: boolean;
  level: null | string;
  levelType: number;
  likeCount: number;
  noteCount: number;
  ownerId: number;
  playCount: number;
  rating: number;
  ratingOnArrangement: number;
  ratingOnConcord: number;
  ratingOnCreativity: number;
  ratingOnFeel: number;
  ratingOnImpression: number;
  ratingOnVisualEffects: number;
  score: number;
  songId: string;
  title: null | string;
}

export interface RecordDto {
  accuracy: number;
  applicationId: string;
  bad: number;
  chartId: string;
  dateCreated: Date;
  dateLiked: Date | null;
  goodEarly: number;
  goodJudgment: number;
  goodLate: number;
  id: string;
  isFullCombo: boolean;
  likeCount: number;
  maxCombo: number;
  miss: number;
  ownerId: number;
  perfect: number;
  perfectJudgment: number;
  position: number;
  rks: number;
  score: number;
  stdDeviation: number;
}

export interface CommentDto {
  content: string;
  dateCreated: Date;
  dateLiked: Date | null;
  id: string;
  language: null | string;
  likeCount: number;
  ownerId: number;
  replyCount: number;
  resourceId: string;
}

export interface ChartLevelDto {
  count: number;
  levelType: number;
}

export interface ReplyDto {
  commentId: string;
  content: string;
  dateCreated: Date;
  dateLiked: Date | null;
  id: string;
  language: string;
  likeCount: number;
  ownerId: number;
}

export interface VoteDto {
  arrangement: number;
  chartId: string;
  concord: number;
  creativity: number;
  dateCreated: Date;
  feel: number;
  id: string;
  impression: number;
  multiplier: number;
  ownerId: number;
  total: number;
  visualEffects: number;
}
