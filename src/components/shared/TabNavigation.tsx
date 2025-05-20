import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)'
  }
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ paddingTop: '24px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

interface TabNavigationProps {
  tabs: { label: string; icon?: React.ReactNode }[];
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, value, onChange }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs 
          value={value} 
          onChange={onChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="audience research tabs"
        >
          {tabs.map((tab, index) => (
            <StyledTab 
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </StyledTabs>
      </Box>
    </Box>
  );
};

export default TabNavigation; 