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

export interface Chapter {
    accessibility: number;
    description: null | string;
    events_incl: string[];
    id: number;
    illustration: string;
    illustrator: string;
    like: number | null;
    like_count: number;
    owner: number | User;
    songs: Song[];
    subtitle: string;
    time: string;
    title: string;
}

export interface ChartLevel {
    level: string;
    count: number;
}

export interface Song {
    accessibility: number;
    bpm: string;
    chapters: number | Chapter[];
    charts: number | Chart[];
    composer: string;
    description: null | string;
    duration: string;
    edition: string;
    event_part: null | number;
    events_incl: string[];
    id: number;
    illustration: string;
    illustrator: string;
    levels: ChartLevel[];
    like: number | null;
    like_count: number;
    lyrics: string;
    name: string;
    offset: number;
    original: boolean;
    uploader: number | User;
    preview_end: string;
    preview_start: string;
    song: string;
    time: string;
}

export interface Chart {
    at_event: boolean;
    chart: null | string;
    charter: null | string;
    description: string;
    difficulty: number;
    event_part: null | number;
    events_incl: string[];
    format: number;
    id: number;
    level: string;
    like: number | null;
    like_count: number;
    notes: number;
    owner: number | null | User;
    r_arrangement: number;
    r_concord: number;
    r_feel: number;
    r_impression: number;
    r_innovativeness: number;
    r_vfx: number;
    ranked: boolean;
    rating: number;
    score: number;
    song: number | Song;
    time: string;
    vote: null | Vote;
    votes: number;
    records: null | Record[];
}

export interface Comment {
    chapter: number | null;
    chart: number | null;
    content: string;
    creation: string;
    deletion: null | string;
    event: number | null;
    id: number;
    language: string;
    last_edit: string;
    like: number | null;
    like_count: number;
    pinned: boolean;
    replies: number;
    song: number | null;
    user: User;
}

export interface Reply {
    comment: number | null;
    content: string;
    creation: string;
    deletion: null | string;
    discussion: number | null;
    id: number;
    language: string;
    last_edit: string;
    like: number | null;
    like_count: number;
    reply: number | null;
    replies: number;
    user: User;
}

export interface RecorderRequest {
    id: number;
    user: User;
    chart: string;
    charter: string | null;
    illustration: string;
    illustrator: string | null;
    song: string;
    name: string;
    composer: string | null;
    level: string;
    difficulty: string;
    note_size: number;
    resolution: string;
    audio_option: number;
    tip: string | null;
    avatar: string | null;
    username: string | null;
    total_score: number;
    rks: number | null;
    challenge_color: number | null;
    challenge_difficulty: number | null;
    addition: string | null;
    status: number;
    reply: string | null;
    replier: User | null;
    requested_at: string;
    replied_at: string | null;
}

export interface RecorderRequestError {
    chart?: string[];
    detail?: string;
    difficulty?: string[];
    illustration?: string[];
    level?: string[];
    name?: string[];
    note_size?: string[];
    resolution?: string[];
    song?: string[];
    total_score?: string[];
    charter?: string[];
    illustrator?: string[];
    composer?: string[];
    audio_option?: string[];
    tip?: string[];
    avatar?: string[];
    username?: string[];
    rks?: string[];
    challenge_color?: string[];
    challenge_difficulty?: string[];
    addition?: string[];
}

export interface SongSubmissionError {
    name?: string[];
    song?: string[];
    edition?: string[];
    illustration?: string[];
    composer?: string[];
    illustrator?: string[];
    bpm?: string[];
    offset?: string[];
    preview_start?: string[];
    preview_end?: string[];
    description?: string[];
    chapters?: string[];
}
export interface ChartSubmissionError {
    song?: string[];
    song_upload?: string[];
    chart?: string[];
    level?: string[];
    difficulty?: string[];
    description?: string[];
    charter?: string[];
    notes?: string[];
    event_part?: string[];
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

export interface Record {
    acc: number;
    bad: number;
    chart: number | Chart;
    event_part: null | number;
    full_combo: boolean;
    good_early: number;
    good_judgment: number;
    good_late: number;
    id: number;
    max_combo: number;
    miss: number;
    perfect: number;
    perfect_judgment: number;
    player: number | User;
    rks: number;
    score: number;
    time: string;
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
    representation: number | null;
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
    level: string;
    notes: number;
    representation: number | null;
    song: null | Song;
    song_upload: null | SongSubmission;
    status: number;
    time: string;
    uploader: number | User;
    volunteer_status: boolean;
    votes: VolunteerVote[];
}

export interface VolunteerVote {
    message: string,
    time: string,
    value: number
}

export interface Collaboration {
    chart: number | ChartSubmission;
    id: number;
    invitee: number | User;
    inviter: number | User;
    status: number;
    time: string;
}
