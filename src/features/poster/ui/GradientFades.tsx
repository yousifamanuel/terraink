import { withAlpha } from "@/shared/utils/color";
import type { PosterStyleTemplate } from "@/features/poster/domain/posterStyleTemplates";

interface GradientFadesProps {
  color: string;
  template: PosterStyleTemplate;
}

/**
 * CSS gradient overlays that fade the top and bottom of the poster frame.
 * Matches the canvas-based `applyFades()` behaviour but runs on the GPU.
 */
export default function GradientFades({ color, template }: GradientFadesProps) {
  const solid = withAlpha(color, 1);
  const transparent = withAlpha(color, 0);
  const { fade } = template;

  return (
    <>
      {fade.top ? (
        <div
          className="poster-fade poster-fade--top"
          style={{
            height: `${fade.top * 100}%`,
            background: `linear-gradient(to bottom, ${solid}, ${transparent})`,
          }}
        />
      ) : null}
      {fade.bottom ? (
        <div
          className="poster-fade poster-fade--bottom"
          style={{
            height: `${fade.bottom * 100}%`,
            background: `linear-gradient(to top, ${solid}, ${transparent})`,
          }}
        />
      ) : null}
      {fade.left ? (
        <div
          className="poster-fade poster-fade--left"
          style={{
            width: `${fade.left * 100}%`,
            background: `linear-gradient(to right, ${solid}, ${transparent})`,
          }}
        />
      ) : null}
      {fade.right ? (
        <div
          className="poster-fade poster-fade--right"
          style={{
            width: `${fade.right * 100}%`,
            background: `linear-gradient(to left, ${solid}, ${transparent})`,
          }}
        />
      ) : null}
    </>
  );
}
