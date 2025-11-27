export interface Resources {
  song: File;
  chart: File;
  illustration: File;
  assets: {
    name: string;
    type: number;
    file: File;
  }[];
}

export interface Metadata {
  title: string | null;
  composer: string | null;
  charter: string | null;
  illustrator: string | null;
  levelType: 0 | 1 | 2 | 3 | 4;
  level: string | null;
  difficulty: number | null;
}

export interface ChartBundle {
  resources: Resources;
  metadata: Metadata;
}

export interface RpeMeta {
  RPEVersion: number;
  background: string;
  charter: string;
  composer: string;
  duration?: number;
  id: string;
  illustration?: string;
  level: string;
  name: string;
  offset: number;
  song: string;
}

export interface Bpm {
  bpm: number;
  startTime: [number, number, number];
  startBeat: number;
  startTimeSec: number;
}

export interface RpeJson {
  BPMList: Bpm[];
  META: RpeMeta;
}

export interface MilthmMeta {
  offset: number;
}

export interface MilthmBpm {
  bpm: number;
  time: [number, number, number];
}

export interface MilthmJson {
  meta: MilthmMeta;
  bpms: MilthmBpm[];
  lines: unknown[];
}
