# Vercel Deployment Instructions

## Changes Made

1. **Created `vercel.json`** - Configuration file for Vercel deployment
2. **Modified `src/main.ts`** - Added serverless handler export for Vercel
3. **Added CORS configuration** - For cross-origin requests
4. **Created `.vercelignore`** - To optimize deployment by excluding unnecessary files

## Environment Variables

Make sure to set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## Deployment Steps

1. **Build locally to test** (optional):
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   # If you have Vercel CLI installed
   vercel --prod
   
   # Or push to your connected Git repository
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

## How it Works

- **Local Development**: The app runs normally using `bootstrap()` function
- **Vercel (Serverless)**: The app exports a `handler` function that Vercel can use
- **Caching**: The Express app is cached to improve performance on subsequent requests

## Troubleshooting

If you still get deployment errors:

1. Check Vercel build logs for specific error messages
2. Ensure all environment variables are set correctly
3. Make sure your MongoDB connection string allows connections from Vercel's IP ranges
4. Check that your dependencies are in `dependencies` not `devDependencies`

## Testing

After deployment, test your endpoints:
- GET `/` - Should return your app controller response
- Your specific API endpoints should work as expected