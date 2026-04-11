import type { PosterForm } from "@/features/poster/application/posterReducer";

export interface PosterPreset {
  id: string;
  name: string;
  createdAt: number;
  form: PosterForm;
  customColors: Record<string, string>;
}
