# MAC Address Management App

A modern, colorful, and minimal web application for managing MAC address records with MongoDB backend.

## Features

- 🔒 **PIN-based Security** - Lock screen with PIN protection
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Colorful UI** - Modern gradient design with beautiful animations
- 🔍 **Smart Search** - Search by name, MAC address, or phone
- ✨ **Auto-formatting** - MAC addresses automatically formatted with colons
- 📊 **Dashboard Overview** - Statistics and quick actions
- ✏️ **Inline Editing** - Edit records directly in the table

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS with gradients and animations
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd macapp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/macapp
PIN_CODE=1234
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment on Vercel

This app is optimized for Vercel deployment:

1. **Push to GitHub** - Commit your code to a GitHub repository

2. **Connect to Vercel** - Import your project on [vercel.com](https://vercel.com)

3. **Set Environment Variables** in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `PIN_CODE` - Your security PIN (optional, defaults to 1234)

4. **Deploy** - Vercel will automatically build and deploy your app

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PIN_CODE` | Security PIN for app access | No (default: 1234) |

## Project Structure

```
macapp/
├── app/
│   ├── api/          # API routes
│   ├── components/   # React components
│   ├── globals.css   # Global styles
│   └── page.tsx      # Main app page
├── lib/
│   ├── models/       # Mongoose models
│   ├── mongodb.ts    # Database connection
│   └── auth.ts       # Authentication logic
└── public/           # Static assets
```

## API Endpoints

- `GET /api/records` - List all records with optional search
- `POST /api/records` - Create new record
- `GET /api/records/[id]` - Get specific record
- `PATCH /api/records/[id]` - Update record
- `DELETE /api/records/[id]` - Delete record
- `POST /api/lock` - Lock the application
- `GET /api/status` - Check lock status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
