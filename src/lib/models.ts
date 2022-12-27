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
    language: string;
    last_login: null | string;
    notifications?: number;
    rks: number;
    tag: null | string;
    type: string;
    username: string;
}

export interface Song {
    accessibility: number;
    bpm: string;
    chapters: number[];
    composer: string;
    description: null | string;
    duration: string;
    event_part: number | null;
    events_incl: string[];
    id: number;
    illustration: string;
    illustrator: string;
    like?: number | null;
    likes?: number;
    lyrics: string;
    name: string;
    original: boolean;
    owner: number | User;
    preview_end: string;
    preview_start: string;
    song: string;
    time: string;
}

export interface Chart {
    charter: string;
    description: string;
    difficulty: number;
    id: number;
    level: string;
    like: number | null;
    likes: number;
    notes: number;
    owner: number | User;
    r_arrangement: number;
    r_concord: number;
    r_feel: number;
    r_innovativeness: number;
    r_vfx: number;
    ranked: boolean;
    rating: number;
    score: number;
    song: number | Song;
    time: string;
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
    likes: number;
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
    likes: number;
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