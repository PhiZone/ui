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
