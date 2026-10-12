/**
 * CornerDecor —— 四角装饰组件
 * EVE Online HUD 取景框风格，渲染四个（或对角两个）绝对定位角标
 */

interface CornerDecorProps {
  /** 边框颜色，默认 'var(--gold)' */
  color?: string;
  /** 角标尺寸，默认 18 */
  size?: number;
  /** 边框粗细，默认 2 */
  borderWidth?: number;
  /** 透明度，默认 0.4 */
  opacity?: number;
  /** 是否只显示对角 */
  diagonal?: 'bl-tr' | 'tl-br' | false;
}

const CORNER_POSITIONS = ['tl', 'tr', 'bl', 'br'] as const;

export default function CornerDecor({
  color = 'var(--gold)',
  size = 18,
  borderWidth = 2,
  opacity = 0.4,
  diagonal = false,
}: CornerDecorProps) {
  const offset = -borderWidth;

  const positions = diagonal
    ? diagonal === 'bl-tr'
      ? (['bl', 'tr'] as const)
      : (['tl', 'br'] as const)
    : CORNER_POSITIONS;

  return (
    <>
      {positions.map((pos) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          width: size,
          height: size,
          pointerEvents: 'none',
          border: `${borderWidth}px solid ${color}`,
          opacity,
        };

        switch (pos) {
          case 'tl':
            style.top = offset;
            style.left = offset;
            style.borderRight = 'none';
            style.borderBottom = 'none';
            break;
          case 'tr':
            style.top = offset;
            style.right = offset;
            style.borderLeft = 'none';
            style.borderBottom = 'none';
            break;
          case 'bl':
            style.bottom = offset;
            style.left = offset;
            style.borderRight = 'none';
            style.borderTop = 'none';
            break;
          case 'br':
            style.bottom = offset;
            style.right = offset;
            style.borderLeft = 'none';
            style.borderTop = 'none';
            break;
        }

        return <span key={pos} style={style} />;
      })}
    </>
  );
}
