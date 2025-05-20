import React from 'react';
import { Box, Paper, Typography, Grid, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeatmapCell = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'intensity' && prop !== 'isHeader'
})<{ intensity: number; isHeader?: boolean }>(({ theme, intensity, isHeader }) => ({
  backgroundColor: isHeader 
    ? theme.palette.grey[200] 
    : `rgba(33, 150, 243, ${Math.max(0.1, Math.min(intensity, 1))})`,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: isHeader 
    ? theme.palette.text.primary 
    : intensity > 0.6 ? '#fff' : theme.palette.text.primary,
  fontWeight: isHeader ? 600 : 400,
  transition: 'transform 0.2s',
  cursor: isHeader ? 'default' : 'pointer',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: isHeader ? 'none' : 'scale(1.02)',
    zIndex: 1,
    boxShadow: isHeader ? theme.shadows[0] : theme.shadows[4],
  }
}));

export interface HeatmapData {
  xLabels: string[];
  yLabels: string[];
  data: number[][];
  tooltips?: string[][];
  minValue?: number;
  maxValue?: number;
}

interface HeatmapGridProps {
  data: HeatmapData;
  title?: string;
  subtitle?: string;
  onCellClick?: (x: number, y: number, value: number) => void;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  data,
  title,
  subtitle,
  onCellClick
}) => {
  const { xLabels, yLabels, data: values, tooltips, minValue = 0, maxValue = 1 } = data;
  
  const getNormalizedValue = (value: number) => {
    if (value === null || value === undefined) return 0;
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const handleCellClick = (xIndex: number, yIndex: number, value: number) => {
    if (onCellClick) {
      onCellClick(xIndex, yIndex, value);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Grid container spacing={1}>
          {/* Top-left empty cell */}
          <Grid item>
            <HeatmapCell intensity={0} isHeader />
          </Grid>
          
          {/* X-axis labels */}
          {xLabels.map((label, index) => (
            <Grid item key={`x-${index}`} xs>
              <HeatmapCell intensity={0} isHeader>
                <Typography variant="body2">{label}</Typography>
              </HeatmapCell>
            </Grid>
          ))}
          
          {/* Y-axis labels and data cells */}
          {yLabels.map((yLabel, yIndex) => (
            <React.Fragment key={`row-${yIndex}`}>
              {/* Y-axis label */}
              <Grid item>
                <HeatmapCell intensity={0} isHeader>
                  <Typography variant="body2">{yLabel}</Typography>
                </HeatmapCell>
              </Grid>
              
              {/* Data cells */}
              {xLabels.map((_, xIndex) => {
                const value = values[yIndex][xIndex];
                const tooltipText = tooltips ? tooltips[yIndex][xIndex] : `Value: ${value}`;
                const intensity = getNormalizedValue(value);
                
                return (
                  <Grid item key={`cell-${yIndex}-${xIndex}`} xs>
                    <Tooltip title={tooltipText} arrow>
                      <HeatmapCell 
                        intensity={intensity}
                        onClick={() => handleCellClick(xIndex, yIndex, value)}
                      >
                        <Typography variant="body2">
                          {value}
                        </Typography>
                      </HeatmapCell>
                    </Tooltip>
                  </Grid>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HeatmapGrid; 