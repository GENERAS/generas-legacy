const fs = require('fs');
const content = `# Supabase Configuration
VITE_SUPABASE_URL=https://ctqqcsqakogvjfuymael.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cXFjc3Fha29ndmpmdXltYWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzE5NDEsImV4cCI6MjA5MDMwNzk0MX0.svwq7diwntl9NPMDEIuxb9xOsMBzCucHl0-oFdN9mpk
VITE_RESEND_API_KEY=re_PqpFcH9S_JEz82WDT2N3poenawLE3hz9x
`;
fs.writeFileSync('.env', content);
console.log('.env file created successfully');
