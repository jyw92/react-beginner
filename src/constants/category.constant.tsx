import {Flame, List} from 'lucide-react';

export const CLASS_CATEGORY = [
  {
    id: 1,
    label: '전체',
    category: '',
    icon: <List />,
  },
  {
    id: 2,
    label: '핫이슈',
    category: 'hot-issue',
    icon: <Flame />,
  },
];

export const TOPIC_CATEGORY = [
  {
    id: 1,
    label: '핫이슈',
    category: 'hot-issue',
  },
];
