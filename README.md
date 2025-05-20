# Adsightful Frontend Application

Adsightful is a powerful platform for advertising insights and campaign planning.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Adsightful-front-end-App-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   To get an API key:
   - Create an account at [OpenAI](https://platform.openai.com/)
   - Navigate to API Keys and create a new secret key
   - Copy the key and paste it in your `.env` file

4. **Run the application locally**
   ```bash
   npm start
   ```

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add the following environment variables in your Vercel project settings:
     - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - Deploy!

### Environment Variables

The following environment variables are required for deployment:

- `VITE_OPENAI_API_KEY`: Your OpenAI API key for AI-powered features
- `NODE_ENV`: Set automatically by Vercel (development/production)

## Data Storage

For the MVP version, the application uses localStorage for data persistence. This allows for quick setup and testing without requiring a database connection.

In future versions, the application can be connected to a Neon PostgreSQL database for proper server-side storage.

## Architecture

- **Frontend**: React application with TypeScript and Tailwind CSS
- **API**: Serverless functions using Vercel
- **Storage**: Local storage for MVP, with database integration planned

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Runs tests
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Features

- User authentication with company profile
- Audience research based on company website
- AI-powered audience segmentation and persona creation
- Platform-specific advertising strategy generation
- Creative asset generation using BlackForest Labs' FLUX1
- Campaign performance tracking and insights
- Persistent storage of user data with Neon Database

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Neon PostgreSQL Database (for persistent storage)

## BlackForest Labs Integration

The platform uses BlackForest Labs' FLUX1 model to generate ad creatives based on audience strategies. To enable this feature:

1. Create an account at [BlackForest Labs](https://api.us1.bfl.ai/)
2. Generate an API key in your account dashboard
3. Add the API key to your `.env` file as `REACT_APP_BFL_API_KEY`

## Usage

1. First time users will be prompted to enter their email, company name, and company URL
2. Navigate to the Audience Research Agent to analyze your company's target audience
3. Save audience strategies to your profile
4. Use the Creative Asset Library to generate platform-specific ad creatives based on your audience strategies
5. Download and use the generated creatives in your marketing campaigns

## License

[MIT](LICENSE)
