import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Card, CardContent, Chip, 
  List, ListItem, ListItemText, Divider, Button,
  Tab, Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faChartLine, faBullseye, faLightbulb, 
  faChartBar, faFunnelDollar, faChessBoard, faBullhorn,
  faComments, faFileAlt, faListCheck, faDownload,
  faShare, faEdit, faBuilding, faMagnifyingGlass,
  faUserGroup, faRoad, faCog, faStore, faLaptop,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, faLinkedin, faInstagram, 
  faTwitter, faYoutube, faTiktok 
} from '@fortawesome/free-brands-svg-icons';
import { AudienceBrief } from '../../types/audience';
import MetricCard from '../shared/MetricCard';
import ActionButton from '../shared/ActionButton';
import FunnelChart from '../visualizations/FunnelChart';
import HeatmapGrid from '../visualizations/HeatmapGrid';
import Grid from '../shared/GridFix';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
}));

const TabPanel = (props: { children: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

interface AudienceResearchResultsProps {
  data: AudienceBrief;
}

export default function AudienceResearchResults({ data }: AudienceResearchResultsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [personaTabValue, setPersonaTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePersonaTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPersonaTabValue(newValue);
  };

  // Format the date for display
  const formattedDate = data.generatedAt || new Date().toLocaleDateString();
  const projectName = data.projectName || 'Audience Research Brief';

  // Get channel icon based on name
  const getChannelIcon = (channel: string) => {
    const lowerChannel = channel.toLowerCase();
    if (lowerChannel.includes('facebook')) return <FontAwesomeIcon icon={faFacebook} />;
    if (lowerChannel.includes('linkedin')) return <FontAwesomeIcon icon={faLinkedin} />;
    if (lowerChannel.includes('instagram')) return <FontAwesomeIcon icon={faInstagram} />;
    if (lowerChannel.includes('twitter')) return <FontAwesomeIcon icon={faTwitter} />;
    if (lowerChannel.includes('youtube')) return <FontAwesomeIcon icon={faYoutube} />;
    if (lowerChannel.includes('tiktok')) return <FontAwesomeIcon icon={faTiktok} />;
    return <FontAwesomeIcon icon={faBullhorn} />;
  };

  // Generate funnel data for visualization
  const generateFunnelData = () => {
    if (!data.funnel || data.funnel.length === 0) return [];
    
    // Use the first funnel mapping
    const funnel = data.funnel[0];
    
    return [
      { 
        name: 'Awareness', 
        value: 'Addressing: ' + funnel.awarenessObjection,
        dropOff: 20
      },
      { 
        name: 'Consideration', 
        value: 'Addressing: ' + funnel.considerationObjection,
        dropOff: 50
      },
      { 
        name: 'Decision', 
        value: 'Addressing: ' + funnel.decisionObjection,
        dropOff: 10
      }
    ];
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      {/* Header with title and date */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {projectName}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Generated on {formattedDate}
          </Typography>
        </Box>
        <Box>
          <ActionButton 
            startIcon={<FontAwesomeIcon icon={faDownload} />}
            sx={{ mr: 1 }}
          >
            Export
          </ActionButton>
          <ActionButton 
            startIcon={<FontAwesomeIcon icon={faEdit} />}
            color="primary"
            variant="outlined"
          >
            Edit
          </ActionButton>
        </Box>
      </Paper>

      {/* Product Summary Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faBuilding} style={{ marginRight: '12px' }} />
          Product Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {data.productSummary}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }} component="div">
          <Grid item xs={12} md={6} component="div">
            <Typography variant="h6" gutterBottom>
              Key Differentiators
            </Typography>
            <Box>
              {data.marketAnalysis.keyDifferentiators.map((item: string, index: number) => (
                <StyledChip
                  key={index}
                  label={item}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6} component="div">
            <Typography variant="h6" gutterBottom>
              Market Size
            </Typography>
            <Typography variant="body1">
              {data.marketAnalysis.marketSize}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabbed Navigation */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Competitor Landscape" icon={<FontAwesomeIcon icon={faStore} />} iconPosition="start" />
          <Tab label="User Personas" icon={<FontAwesomeIcon icon={faUserGroup} />} iconPosition="start" />
          <Tab label="Content Strategy" icon={<FontAwesomeIcon icon={faFileAlt} />} iconPosition="start" />
          <Tab label="Implementation Tactics" icon={<FontAwesomeIcon icon={faRoad} />} iconPosition="start" />
        </Tabs>

        {/* Competitor Landscape Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Competitive Landscape Analysis
            </Typography>
            <Grid container spacing={3} component="div">
              {data.marketAnalysis.competitiveLandscape.map((competitor, index) => (
                <Grid item xs={12} md={6} key={index} component="div">
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {competitor}
                      </Typography>
                      {data.competitiveAnalysis?.competitors[index] && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" paragraph>
                            <strong>Positioning:</strong> {data.competitiveAnalysis.competitors[index].positioning}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Advertising Strategies:</strong>
                          </Typography>
                          <List dense>
                            {data.competitiveAnalysis.competitors[index].keyMessages.map((message, msgIdx) => (
                              <ListItem key={msgIdx}>
                                <ListItemText primary={message} />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Differentiation Opportunities
              </Typography>
              <List>
                {data.competitiveAnalysis?.differentiationOpportunities.map((opportunity, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={opportunity} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </TabPanel>

        {/* User Personas Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Tabs
              value={personaTabValue}
              onChange={handlePersonaTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              {data.personas.map((persona, index) => (
                <Tab key={index} label={persona.name} />
              ))}
            </Tabs>
            
            {data.personas.map((persona, index) => (
              <Box key={index} hidden={personaTabValue !== index}>
                <Typography variant="h6" gutterBottom>
                  {persona.name}, {persona.role}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Age: {persona.ageRange}
                </Typography>
                
                <Grid container spacing={3} component="div">
                  {/* Pain Points */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: '8px' }} />
                          Pain Points
                        </Typography>
                        <List dense>
                          {persona.painPoints.map((point, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={point} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Motivations */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faBullseye} style={{ marginRight: '8px' }} />
                          Motivations
                        </Typography>
                        <List dense>
                          {persona.motivations.map((item, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Psychographics */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '8px' }} />
                          Psychographics
                        </Typography>
                        <Box>
                          {persona.psychographics.map((item, idx) => (
                            <StyledChip key={idx} label={item} color="primary" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Interests */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faHashtag} style={{ marginRight: '8px' }} />
                          Interests
                        </Typography>
                        <Box>
                          {persona.interests.map((item, idx) => (
                            <StyledChip key={idx} label={item} color="secondary" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Behaviors */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '8px' }} />
                          Behaviors
                        </Typography>
                        <Box>
                          {persona.behaviors.map((item, idx) => (
                            <StyledChip key={idx} label={item} color="info" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Advertising Channels */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faBullhorn} style={{ marginRight: '8px' }} />
                          Advertising Channels
                        </Typography>
                        <Grid container spacing={1} component="div">
                          {persona.targetChannels.map((channel, idx) => (
                            <Grid item key={idx} component="div">
                              <Chip
                                icon={getChannelIcon(channel)}
                                label={channel}
                                color="primary"
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Search Keywords */}
                  <Grid item xs={12} md={6} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '8px' }} />
                          Search Keywords
                        </Typography>
                        <Box>
                          {persona.searchKeywords.map((keyword, idx) => (
                            <StyledChip key={idx} label={keyword} color="secondary" variant="outlined" />
                          ))}
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  {/* Funnel Journey Map */}
                  <Grid item xs={12} component="div">
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <FontAwesomeIcon icon={faFunnelDollar} style={{ marginRight: '8px' }} />
                          Funnel Journey Map
                        </Typography>
                        {data.funnel && data.funnel[index] && (
                          <Box sx={{ mt: 2 }}>
                            <FunnelChart 
                              stages={generateFunnelData()}
                              title="Customer Journey"
                              subtitle="Addressing objections at each stage"
                            />
                            
                            <Grid container spacing={3} sx={{ mt: 2 }} component="div">
                              <Grid item xs={12} md={4} component="div">
                                <Typography variant="subtitle2" gutterBottom>
                                  Awareness Stage
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  <strong>Objection:</strong> {data.funnel[index].awarenessObjection}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  <strong>CTAs:</strong>
                                </Typography>
                                <List dense>
                                  {data.funnel[index].ctas.awareness.map((cta, ctaIdx) => (
                                    <ListItem key={ctaIdx}>
                                      <ListItemText primary={cta} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Grid>
                              
                              <Grid item xs={12} md={4} component="div">
                                <Typography variant="subtitle2" gutterBottom>
                                  Consideration Stage
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  <strong>Objection:</strong> {data.funnel[index].considerationObjection}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  <strong>CTAs:</strong>
                                </Typography>
                                <List dense>
                                  {data.funnel[index].ctas.consideration.map((cta, ctaIdx) => (
                                    <ListItem key={ctaIdx}>
                                      <ListItemText primary={cta} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Grid>
                              
                              <Grid item xs={12} md={4} component="div">
                                <Typography variant="subtitle2" gutterBottom>
                                  Decision Stage
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  <strong>Objection:</strong> {data.funnel[index].decisionObjection}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  <strong>CTAs:</strong>
                                </Typography>
                                <List dense>
                                  {data.funnel[index].ctas.decision.map((cta, ctaIdx) => (
                                    <ListItem key={ctaIdx}>
                                      <ListItemText primary={cta} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Content Strategy Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Strategy Recommendations
            </Typography>
            
            <Grid container spacing={3} component="div">
              {data.contentStrategy?.recommendedFormats.map((format, index) => (
                <Grid item xs={12} md={6} key={index} component="div">
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {format.format}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {format.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Example:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {format.example}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          <strong>Engagement:</strong> {format.performance.engagement}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Conversion:</strong> {format.performance.conversion}
                        </Typography>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Messaging Framework
              </Typography>
              <Grid container spacing={3} component="div">
                <Grid item xs={12} md={4} component="div">
                  <StyledCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Headlines
                      </Typography>
                      <List dense>
                        {data.contentStrategy?.messagingFramework.headlines.map((headline, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={headline} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} md={4} component="div">
                  <StyledCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Body Copy
                      </Typography>
                      <List dense>
                        {data.contentStrategy?.messagingFramework.bodyCopy.map((copy, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={copy} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} md={4} component="div">
                  <StyledCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        CTAs
                      </Typography>
                      <List dense>
                        {data.contentStrategy?.messagingFramework.ctas.map((cta, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={cta} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        {/* Implementation Tactics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Implementation Tactics
            </Typography>
            
            <Grid container spacing={3} component="div">
              {/* Quick Wins */}
              <Grid item xs={12} md={6} component="div">
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: '8px' }} />
                      Quick Wins
                    </Typography>
                    <List>
                      {data.implementationPlan?.quickWins.map((win, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={win.description} 
                            secondary={`Impact: ${win.impact} | Effort: ${win.effort}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              {/* Strategic Plays */}
              <Grid item xs={12} md={6} component="div">
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faChessBoard} style={{ marginRight: '8px' }} />
                      Strategic Plays
                    </Typography>
                    <List>
                      {data.implementationPlan?.strategicPlays.map((play, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={play.description} 
                            secondary={`Impact: ${play.impact} | Timeline: ${play.timeline}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </StyledCard>
              </Grid>
              
              {/* Persona-Specific Tactics */}
              <Grid item xs={12} component="div">
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Persona-Specific Tactics
                    </Typography>
                    <Tabs
                      value={personaTabValue}
                      onChange={handlePersonaTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 3 }}
                    >
                      {data.personas.map((persona, index) => (
                        <Tab key={index} label={persona.name} />
                      ))}
                    </Tabs>
                    
                    {data.personas.map((persona, index) => (
                      <Box key={index} hidden={personaTabValue !== index}>
                        <Typography variant="subtitle1" gutterBottom>
                          Tactical Recommendations for {persona.name}
                        </Typography>
                        
                        <Grid container spacing={3} component="div">
                          {/* Channel Recommendations */}
                          {persona.targetChannels.map((channel, chanIdx) => (
                            <Grid item xs={12} md={6} key={chanIdx} component="div">
                              <Card sx={{ mb: 2 }}>
                                <CardContent>
                                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {getChannelIcon(channel)}
                                    <span style={{ marginLeft: '8px' }}>{channel}</span>
                                  </Typography>
                                  
                                  {data.channelStrategies && data.channelStrategies[channel] && (
                                    <>
                                      <Divider sx={{ my: 1 }} />
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Creative Approach:</strong> {data.channelStrategies[channel].creativeApproach}
                                      </Typography>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Budget Allocation:</strong> {data.channelStrategies[channel].budgetAllocation}
                                      </Typography>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Best Practices:</strong>
                                      </Typography>
                                      <List dense>
                                        {data.channelStrategies[channel].bestPractices.slice(0, 2).map((practice, pIdx) => (
                                          <ListItem key={pIdx}>
                                            <ListItemText primary={practice} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </CardContent>
                </StyledCard>
              </Grid>
              
              {/* Testing Framework */}
              <Grid item xs={12} component="div">
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faCog} style={{ marginRight: '8px' }} />
                      Testing Framework
                    </Typography>
                    <Grid container spacing={3} component="div">
                      {data.implementationPlan?.testingFramework.map((test, idx) => (
                        <Grid item xs={12} md={6} key={idx} component="div">
                          <Card sx={{ mb: 2 }}>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                Hypothesis: {test.hypothesis}
                              </Typography>
                              <Typography variant="body2" gutterBottom>
                                <strong>Variables:</strong>
                              </Typography>
                              <List dense>
                                {test.variables.map((variable, varIdx) => (
                                  <ListItem key={varIdx}>
                                    <ListItemText primary={variable} />
                                  </ListItem>
                                ))}
                              </List>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" paragraph>
                                <strong>Success Metrics:</strong> {test.successMetrics.join(', ')}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Expected Outcome:</strong> {test.expectedOutcome}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
} 