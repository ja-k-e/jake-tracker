export interface ActivityItem {
  type: 'qty' | 'sec';
  initial: number;
  id: string;
}

export interface Activity {
  label: string;
  icon: string;
  type: 'instance' | 'multiple' | 'time';
  store: string;
  items?: Array<ActivityItem>;
}

const activities: Array<Activity> = [
  { label: 'Poop', icon: '💩', type: 'instance', store: 'poops' },
  // {
  //   label: 'Workout',
  //   icon: '🏋️',
  //   type: 'multiple',
  //   store: 'workout',
  //   items: [
  //     { type: 'qty', initial: 10, id: 'pushup' },
  //     { type: 'sec', initial: 60, id: 'plank' },
  //     { type: 'qty', initial: 100, id: 'crunch' },
  //     { type: 'qty', initial: 100, id: 'cross_crunch' },
  //   ],
  // },
];

export default activities;
