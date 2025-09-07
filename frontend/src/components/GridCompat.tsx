/**
 * Grid 호환성 래퍼 컴포넌트
 * 
 * MUI v7 Box 기반 Grid 대체 구현
 * 기존 Grid API를 Box flexbox로 변환
 * 
 * @deprecated 점진적으로 Box로 직접 마이그레이션 필요
 */
import React from 'react';
import { Box } from '@mui/material';

interface GridProps {
  children?: React.ReactNode;
  container?: boolean;
  item?: boolean;
  spacing?: number;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  sx?: any;
  [key: string]: any;
}

/**
 * Grid 컴포넌트 호환성 래퍼
 * Box와 flexbox를 사용하여 Grid 기능 구현
 */
export const Grid: React.FC<GridProps> = (props) => {
  const { 
    container, 
    item, 
    xs, 
    sm, 
    md, 
    lg, 
    xl, 
    spacing = 0,
    children,
    sx,
    ...otherProps 
  } = props;

  // Container 스타일
  if (container) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          margin: spacing ? `-${spacing * 4}px` : 0,
          ...sx
        }}
        {...otherProps}
      >
        {children}
      </Box>
    );
  }

  // Item 스타일
  if (item) {
    const getWidth = (size: number | 'auto' | boolean | undefined) => {
      if (size === 'auto') return 'auto';
      if (size === true || size === undefined) return '100%';
      if (typeof size === 'number') return `${(size / 12) * 100}%`;
      return '100%';
    };

    return (
      <Box
        sx={{
          padding: spacing ? `${spacing * 4}px` : 0,
          flexGrow: xs === true ? 1 : 0,
          width: {
            xs: getWidth(xs),
            sm: getWidth(sm),
            md: getWidth(md),
            lg: getWidth(lg),
            xl: getWidth(xl)
          },
          ...sx
        }}
        {...otherProps}
      >
        {children}
      </Box>
    );
  }

  // 기본 Box로 반환
  return <Box sx={sx} {...otherProps}>{children}</Box>;
};

export default Grid;