export interface User {
  avatar: string;
  bio: null | string;
  date_joined: string;
  date_of_birth: null | string;
  exp: number;
  fans: number;
  following: number;
  gender: number;
  id: number;
  is_active: boolean;
  is_following: boolean | null;
  language: string;
  last_login: null | string;
  notifications?: number;
  rks: number;
  tag: null | string;
  type: string;
  username: string;
}

// export interface UserExtra {
//   best_records?: PlayRecord[];
//   charts?: Chart[];
//   comments: Comment[];
//   recent_records?: PlayRecord[];
//   songs?: Song[];
// }

export interface Relation {
  id: number;
  follower: number;
  followee: number;
  time: string;
}

export interface Chapter {
  accessibility: number;
  comment_count: number;
  description: null | string;
  events_incl: string[];
  id: number;
  illustration: string;
  illustrator: string;
  like: number | null;
  like_count: number;
  owner: number;
  songs: number;
  subtitle: string;
  time: string;
  title: string;
}

export interface Song {
  accessibility: number;
  bpm: string;
  chapters: number;
  charts: number;
  comment_count: number;
  composer: string;
  description: null | string;
  duration: string;
  edition: string;
  event_part: null | number;
  events_incl: string[];
  id: number;
  illustration: string;
  illustrator: string;
  levels: number[];
  like: number | null;
  like_count: number;
  lyrics: string;
  name: string;
  offset: number;
  original: boolean;
  uploader: number;
  preview_end: string;
  preview_start: string;
  song: string;
  time: string;
}

export interface Chart {
  at_event: boolean;
  chart: null | string;
  charter: null | string;
  collab_status: boolean;
  comment_count: number;
  description: string;
  difficulty: number;
  event_part: null | number;
  events_incl: string[];
  format: number;
  id: number;
  level_type: number;
  level: string;
  like: number | null;
  like_count: number;
  notes: number;
  owner: number | null;
  r_arrangement: number;
  r_concord: number;
  r_feel: number;
  r_impression: number;
  r_innovativeness: number;
  r_vfx: number;
  ranked: boolean;
  rating: number;
  score: number;
  song: number;
  time: string;
  vote: null | Vote;
  votes: number;
  records: null | PlayRecord[];
}

export interface Like {
  id: number;
  time: string;
  user: number;
  chart: number | null;
  song: number | null;
  chapter: number | null;
  discussion: number | null;
  comment: number | null;
  reply: number | null;
}

export interface Comment {
  chapter: number | null;
  chart: number | null;
  content: string;
  creation: string;
  deletion: null | string;
  discussion: number | null;
  event: number | null;
  id: number;
  language: string;
  last_edit: string;
  like: number | null;
  like_count: number;
  pinned: boolean;
  replies: number;
  song: number | null;
  user: number;
}

export interface Reply {
  comment: number | null;
  content: string;
  creation: string;
  deletion: null | string;
  id: number;
  language: string;
  last_edit: string;
  like: number | null;
  like_count: number;
  user: number;
}

export interface RecorderRequest {
  id: number;
  user: User;
  chart: string;
  charter: string | null;
  illustration: string;
  illustrator: string | null;
  song: string | null;
  name: string;
  composer: string | null;
  level: string;
  difficulty: string;
  note_size: number | null;
  resolution: string | null;
  music_volume: number | null;
  hitsound_volume: number | null;
  tip: string | null;
  avatar: string | null;
  username: string | null;
  total_score: number | null;
  rks: number | null;
  challenge_color: number | null;
  challenge_difficulty: number | null;
  addition: string | null;
  config: string | null;
  status: number;
  reply: string | null;
  replier: User | null;
  requested_at: string;
  replied_at: string | null;
}

export interface Notification {
  deleted_at: null | string;
  id: number;
  message: string;
  notified_at: string;
  read_at: null | string;
  type: number;
  user: number;
}

export interface Vote {
  arrangement: number;
  chart: number;
  concord: number;
  feel: number;
  id: number;
  impression: number;
  innovativeness: number;
  multiplier: number;
  time: string;
  total: number;
  user: number;
  visual_effects: number;
}

export interface PlayRecord {
  id: number;
  max_combo: number;
  perfect: number;
  good_early: number;
  good_late: number;
  bad: number;
  miss: number;
  score: number;
  full_combo: boolean;
  acc: number;
  rks: number;
  perfect_judgment: number;
  good_judgment: number;
  time: string;
  chart_id: number;
  event_part: null | number;
  player: number;
  rank: number;
}

export interface SongSubmission {
  accessibility: number;
  bpm: string;
  chapters: number | Chapter[];
  composer: string;
  description: null | string;
  edition: string;
  event_part: null | number;
  id: number;
  illustration: string;
  illustrator: string;
  lyrics: null | string;
  message: null | string;
  name: string;
  offset: number;
  preview_start: string;
  preview_end: string;
  representation: number | null;
  reviewer: number | User;
  song: string;
  status: number;
  time: string;
  uploader: number | User;
}

export interface ChartSubmission {
  adm_status: boolean;
  chart: string;
  charter: string;
  collab_status: boolean;
  description: null | string;
  difficulty: number;
  event_part: null | number;
  id: number;
  level_type: number;
  level: string;
  notes: number;
  representation: number | null;
  song: null | Song;
  song_upload: null | SongSubmission;
  status: number;
  time: string;
  uploader: number | User;
  volunteer_status: boolean;
  voted: boolean;
  votes: VolunteerVote[];
}

export interface VolunteerVote {
  id?: number;
  message: string;
  time: string;
  value: number;
  user?: User;
}

export interface Collaboration {
  chart: number | ChartSubmission;
  id: number;
  invitee: number | User;
  inviter: number | User;
  status: number;
  time: string;
}

export interface UserInput {
  content: string;
  creation: string;
  deletion: string;
  id: number;
  language: string;
  origin: string;
  type: number;
  user: number;
}
