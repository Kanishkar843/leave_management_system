# Vercel Deployment Instructions

## Environment Variables Required

In your Vercel dashboard, add these environment variables:

### Database Configuration
- `DB_HOST`: Your MySQL database host
- `DB_PORT`: 3306 (or your MySQL port)
- `DB_USER`: Your MySQL username
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: leave_management

### Security
- `JWT_SECRET`: A secure random string for JWT tokens

## Deployment Steps

1. **Connect Repository**: 
   - Go to Vercel dashboard
   - Click "New Project"
   - Import: `https://github.com/Kanishkar843/leave_management_system`

2. **Configure Environment**:
   - Add all environment variables above
   - Make sure to use Vercel's MySQL add-on or external database

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

## Database Setup

### Option 1: Vercel MySQL (Recommended)
1. In Vercel project, go to "Storage"
2. Add MySQL database
3. Use connection details in environment variables

### Option 2: External MySQL
1. Set up MySQL database elsewhere
2. Configure environment variables with connection details
3. Run the setup script manually if needed

## Post-Deployment

1. Test API endpoints: `https://your-app.vercel.app/api/health`
2. Access frontend: `https://your-app.vercel.app`
3. Set up initial admin user via database

## Troubleshooting

- **Build fails**: Check that all environment variables are set
- **Database errors**: Verify MySQL connection details
- **API not working**: Check Vercel function logs

## Architecture

- Frontend: React app served from `/`
- Backend: API functions served from `/api/*`
- Database: MySQL (Vercel or external)
