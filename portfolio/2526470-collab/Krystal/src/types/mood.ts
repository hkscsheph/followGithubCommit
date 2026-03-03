export interface MoodOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: 'very_happy', label: '非常開心', emoji: '😄', color: 'bg-green-500' },
  { value: 'happy', label: '開心', emoji: '😊', color: 'bg-green-400' },
  { value: 'neutral', label: '普通', emoji: '😐', color: 'bg-gray-400' },
  { value: 'sad', label: '難過', emoji: '😢', color: 'bg-blue-400' },
  { value: 'angry', label: '生氣', emoji: '😠', color: 'bg-red-400' },
  { value: 'tired', label: '疲憊', emoji: '😴', color: 'bg-purple-400' },
  { value: 'excited', label: '興奮', emoji: '🤩', color: 'bg-yellow-400' },
  { value: 'anxious', label: '焦慮', emoji: '😰', color: 'bg-orange-400' },
];

export function getMoodOption(value: string): MoodOption | undefined {
  return MOOD_OPTIONS.find(option => option.value === value);
}
