import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const FunnelSegment = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'width'
})<{ color: string; width: string }>(({ theme, color, width }) => ({
  backgroundColor: color,
  width: width,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.3s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

interface FunnelStage {
  name: string;
  value: string | number;
  count?: number;
  percentage?: number;
  color?: string;
  dropOff?: number;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  subtitle?: string;
  onStageClick?: (stage: FunnelStage, index: number) => void;
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  stages,
  title,
  subtitle,
  onStageClick
}) => {
  const defaultColors = [
    '#3f51b5', // indigo
    '#2196f3', // blue
    '#03a9f4', // light blue
    '#00bcd4', // cyan
    '#009688', // teal
  ];

  const handleStageClick = (stage: FunnelStage, index: number) => {
    if (onStageClick) {
      onStageClick(stage, index);
    }
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center', p: 2 }}>
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
        {stages.map((stage, index) => {
          const width = `${100 - (index * 15)}%`;
          const color = stage.color || defaultColors[index % defaultColors.length];
          
          return (
            <FunnelSegment 
              key={index} 
              elevation={2}
              color={color}
              width={width}
              onClick={() => handleStageClick(stage, index)}
            >
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {stage.name}
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {stage.value}
              </Typography>
              {stage.percentage !== undefined && (
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                  {stage.percentage}%
                </Typography>
              )}
              {stage.dropOff !== undefined && index < stages.length - 1 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                    {stage.dropOff > 0 ? `${stage.dropOff}% Drop-off` : 'No Drop-off'}
                  </Typography>
                </Box>
              )}
            </FunnelSegment>
          );
        })}
      </Box>
    </Box>
  );
};

export default FunnelChart; 