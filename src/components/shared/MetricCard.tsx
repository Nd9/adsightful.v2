import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

interface MetricCardProps {
  title: string;
  value: string;
  previousValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  trend,
  trendValue,
  icon,
  color = 'primary',
  subtitle
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <FontAwesomeIcon icon={faArrowUp} style={{ color: '#4caf50' }} />;
      case 'down':
        return <FontAwesomeIcon icon={faArrowDown} style={{ color: '#f44336' }} />;
      default:
        return <FontAwesomeIcon icon={faMinus} style={{ color: '#9e9e9e' }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#4caf50';
      case 'down':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {previousValue && (
              <Typography variant="caption" color="textSecondary">
                Previous: {previousValue}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box 
              sx={{
                backgroundColor: `${color}.lighter`,
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        {trend && trendValue && (
          <Box display="flex" alignItems="center" mt={2}>
            <Box mr={0.5}>
              {getTrendIcon()}
            </Box>
            <Typography 
              variant="body2" 
              style={{ color: getTrendColor() }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default MetricCard; 