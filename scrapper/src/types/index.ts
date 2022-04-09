export type Team = {
  id: number;
  name: string;
  logo_url: string;
};

export type Score = {
  full_score: string;
  score: string | null;
  overs: string | null;
  runrate: string;

  team: number;
  fixture: number;
};

export type Series = {
  id: number;
  title: string;
};

export type Venue = {
  id: number;
  name: string;
};

export type Bowling = {
  bowler: string;
  overs: string;
  maiden: string;
  runs: string;
  wickets: string;
  wides: string;
  noballs: string;
  econ: string;
  active: boolean;

  fixture: number;
  team: number;
};

export type Batting = {
  batsman: string;
  runs: string;
  balls: string;
  fours: string;
  sixes: string;
  strike_rate: string;
  out: string;
  active: boolean;

  fixture: number;
  team: number;
};

export type Extra = {
  b: string;
  w: string;
  no: string;
  lb: string;
  p: string;

  fixture: number;
  team: number;
};

export type Inning = {
  id: number | null;
  batting: Batting[];
  bowling: Bowling[];
  fall_of_wickets: string;

  fixture: number;
  team: number;
};

export type Fixture = {
  id: number;
  status: string;
  status_note: string;
  date: string;
  series: number;
  team_a: number;
  team_b: number;
  scores: Score[];
  venue: number;
  innings: Inning[];
};
