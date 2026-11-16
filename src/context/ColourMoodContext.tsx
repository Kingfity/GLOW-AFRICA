import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  COLOUR_GRADE_PRESETS,
  getColourGradePreset,
  type ColourGradeId,
  type ColourGradePreset,
} from '../utils/careTools';

interface ColourMoodContextValue {
  gradeId: ColourGradeId;
  setGradeId: (id: ColourGradeId) => void;
  gradingEnabled: boolean;
  setGradingEnabled: (enabled: boolean) => void;
  activeGrade: ColourGradePreset;
  presets: ColourGradePreset[];
}

const ColourMoodContext = createContext<ColourMoodContextValue>({
  gradeId: 'golden-hope',
  setGradeId: () => {},
  gradingEnabled: true,
  setGradingEnabled: () => {},
  activeGrade: COLOUR_GRADE_PRESETS[0],
  presets: COLOUR_GRADE_PRESETS,
});

export function ColourMoodProvider({ children }: { children: React.ReactNode }) {
  const [gradeId, setGradeId] = useState<ColourGradeId>('golden-hope');
  const [gradingEnabled, setGradingEnabled] = useState<boolean>(true);

  const value = useMemo<ColourMoodContextValue>(() => {
    return {
      gradeId,
      setGradeId,
      gradingEnabled,
      setGradingEnabled,
      activeGrade: getColourGradePreset(gradeId),
      presets: COLOUR_GRADE_PRESETS,
    };
  }, [gradeId, gradingEnabled]);

  return <ColourMoodContext.Provider value={value}>{children}</ColourMoodContext.Provider>;
}

export function useColourMood() {
  return useContext(ColourMoodContext);
}
