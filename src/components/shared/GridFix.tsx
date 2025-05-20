import React from 'react';
import { Grid as MuiGrid } from '@mui/material';

// This is a wrapper component to fix the compatibility issues with MUI Grid component
// It handles the 'item' prop properly to avoid type errors
type GridFixProps = {
  item?: boolean;
  container?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  spacing?: number;
  children: React.ReactNode;
  component?: React.ElementType;
  sx?: any;
  key?: any;
};

export const Grid: React.FC<GridFixProps> = (props) => {
  // @ts-ignore - This is a temporary fix for MUI Grid component
  return <MuiGrid {...props} />;
};

export default Grid; 