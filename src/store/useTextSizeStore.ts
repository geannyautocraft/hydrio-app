import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface TextSizeState {
  size: TextSize;
  setSize: (size: TextSize) => void;
}

const SIZE_CLASSES: Record<TextSize, string> = {
  normal: 'text-size-normal',
  large: 'text-size-large',
  xlarge: 'text-size-xlarge',
};

function applySizeClass(size: TextSize) {
  const root = document.documentElement;
  Object.values(SIZE_CLASSES).forEach((cls) => root.classList.remove(cls));
  root.classList.add(SIZE_CLASSES[size]);
}

export const useTextSizeStore = create<TextSizeState>()(
  persist(
    (set) => ({
      size: 'normal',
      setSize: (size) => {
        applySizeClass(size);
        set({ size });
      },
    }),
    {
      name: 'hydrio-text-size',
      onRehydrateStorage: () => (state) => {
        applySizeClass(state?.size ?? 'normal');
      },
    }
  )
);
