// High-quality standard portrait samples for quick testing
export interface SampleImage {
  id: string;
  name: string;
  url: string;
  note: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'formal-male',
    name: 'Formal Portrait (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
    note: 'Clean neutral background, standard official posture'
  },
  {
    id: 'formal-female',
    name: 'Formal Portrait (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&fit=crop',
    note: 'Crisp studio lighting, ideal for passport & visa'
  },
  {
    id: 'neutral-young',
    name: 'Neutral Studio Portrait',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&fit=crop',
    note: 'Forward facing, balanced contrast'
  }
];
