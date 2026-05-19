export interface Task {
  id: number;
  name: string;
  start: string;
  end: string;
  color: string;
}

export interface ColorOption {
  id: string;
  val: string;
  name: string;
}

export interface DateRange {
  start: string;
  end: string;
}
