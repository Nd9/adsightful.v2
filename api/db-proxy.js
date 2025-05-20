// Server-side database proxy to avoid exposing connection string in the client
const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if connection string is available
  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return res.status(500).json({ 
      error: 'Database connection string not found in environment variables' 
    });
  }

  try {
    // Initialize SQL client
    const sql = neon(connectionString);

    // Handle different operations based on the request
    const { operation, data } = req.body;

    if (!operation) {
      return res.status(400).json({ error: 'Operation is required' });
    }

    let result;
    
    switch (operation) {
      case 'initializeDatabase':
        // Create users table if it doesn't exist
        await sql`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            company_name TEXT NOT NULL,
            company_url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        result = { message: 'Database initialized successfully' };
        break;
        
      case 'saveUser':
        if (!data || !data.email || !data.companyName || !data.companyUrl) {
          return res.status(400).json({ error: 'User data is required' });
        }
        
        // Check if user already exists
        const existingUsers = await sql`
          SELECT id FROM users WHERE email = ${data.email}
        `;
        
        if (existingUsers.length > 0) {
          // Update existing user
          const updated = await sql`
            UPDATE users
            SET 
              company_name = ${data.companyName},
              company_url = ${data.companyUrl}
            WHERE email = ${data.email}
            RETURNING id, email, company_name as "companyName", company_url as "companyUrl", created_at as "createdAt"
          `;
          
          result = updated.length > 0 ? updated[0] : null;
        } else {
          // Insert new user
          const inserted = await sql`
            INSERT INTO users (email, company_name, company_url)
            VALUES (${data.email}, ${data.companyName}, ${data.companyUrl})
            RETURNING id, email, company_name as "companyName", company_url as "companyUrl", created_at as "createdAt"
          `;
          
          result = inserted.length > 0 ? inserted[0] : null;
        }
        break;
        
      case 'getUserByEmail':
        if (!data || !data.email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        
        const users = await sql`
          SELECT id, email, company_name as "companyName", company_url as "companyUrl", created_at as "createdAt"
          FROM users
          WHERE email = ${data.email}
        `;
        
        result = users.length > 0 ? users[0] : null;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Database operation failed:', error);
    return res.status(500).json({ 
      error: 'Database operation failed', 
      message: error.message 
    });
  }
}; 