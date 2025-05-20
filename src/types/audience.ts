export interface Persona {
  name: string;
  ageRange: string;
  role: string;
  painPoints: string[];
  motivations: string[];
  psychographics: string[];
  interests: string[];
  behaviors: string[];
  targetChannels: string[];
  searchKeywords: string[];
  mediaConsumption: {
    preferredPlatforms: string[];
    contentPreferences: string[];
    peakActivityTimes: string[];
  };
  purchaseBehavior: {
    decisionFactors: string[];
    purchaseTriggers: string[];
    budgetRange: string;
  };
}

export interface FunnelMapping {
  awarenessObjection: string;
  considerationObjection: string;
  decisionObjection: string;
  ctas: {
    awareness: string[];
    consideration: string[];
    decision: string[];
  }
}

export interface ChannelStrategy {
  channel: string;
  audienceSegmentation: string[];
  targetingRecommendations: string[];
  creativeApproach: string;
  budgetAllocation: string;
  kpis: string[];
  bestPractices: string[];
}

export interface Competitor {
  name: string;
  marketShare?: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
  keyMessages: string[];
}

export interface CompetitiveAnalysis {
  marketOverview: string;
  competitors: Competitor[];
  positioningMap?: {
    xAxis: {
      label: string;
      low: string;
      high: string;
    };
    yAxis: {
      label: string;
      low: string;
      high: string;
    };
    positions: {
      competitor: string;
      x: number;
      y: number;
      size: number;
    }[];
  };
  differentiationOpportunities: string[];
}

export interface ContentRecommendation {
  format: string;
  description: string;
  example: string;
  performance: {
    engagement: string;
    conversion: string;
  };
}

export interface ContentStrategy {
  recommendedFormats: ContentRecommendation[];
  messagingFramework: {
    headlines: string[];
    bodyCopy: string[];
    ctas: string[];
  };
  contentCalendar?: {
    timeline: {
      week: number;
      content: string;
      channel: string;
      objective: string;
    }[];
  };
}

export interface ActionItem {
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: 'immediate' | 'short-term' | 'long-term';
}

export interface TestRecommendation {
  hypothesis: string;
  variables: string[];
  successMetrics: string[];
  expectedOutcome: string;
}

export interface ImplementationPlan {
  quickWins: ActionItem[];
  strategicPlays: ActionItem[];
  testingFramework: TestRecommendation[];
  resourceAllocation?: {
    budget: {
      channel: string;
      percentage: number;
    }[];
    team: {
      role: string;
      responsibilities: string[];
    }[];
  };
}

export interface AudienceBrief {
  productSummary: string;
  marketAnalysis: {
    competitiveLandscape: string[];
    marketSize: string;
    keyDifferentiators: string[];
  };
  personas: Persona[];
  funnel: FunnelMapping[];
  mediaStrategy: {
    recommendedChannels: {
      channel: string;
      rationale: string;
      estimatedReach: string;
      recommendedBudget: string;
    }[];
    adFormats: {
      channel: string;
      formats: string[];
      bestPractices: string[];
    }[];
    contentStrategy: {
      themes: string[];
      messagingFrameworks: string[];
      creativeGuidelines: string[];
    };
  };
  performanceMetrics: {
    kpis: string[];
    benchmarks: {
      ctr: string;
      cpc: string;
      conversionRate: string;
    };
    testingStrategy: string[];
  };
  channelStrategies?: Record<string, ChannelStrategy>;
  // New fields to support the enhanced UI
  competitiveAnalysis?: CompetitiveAnalysis;
  contentStrategy?: ContentStrategy;
  implementationPlan?: ImplementationPlan;
  generatedAt?: string;
  projectName?: string;
}

export interface AudienceResearchInput {
  url?: string;
  rawText?: string;
  projectName?: string;
} 