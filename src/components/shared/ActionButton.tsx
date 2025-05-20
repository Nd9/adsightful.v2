import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

interface ActionButtonProps extends ButtonProps {
  impact?: 'high' | 'medium' | 'low';
  tooltip?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  impact,
  tooltip,
  variant = 'contained',
  color = 'primary',
  ...rest
}) => {
  const getImpactColor = () => {
    if (!impact) return color;
    
    switch (impact) {
      case 'high':
        return 'success';
      case 'medium':
        return 'primary';
      case 'low':
        return 'secondary';
      default:
        return color;
    }
  };

  const buttonElement = (
    <StyledButton
      variant={variant}
      color={getImpactColor()}
      {...rest}
    >
      {children}
    </StyledButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default ActionButton; 