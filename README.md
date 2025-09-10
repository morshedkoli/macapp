# Admin Dashboard

A modern, secure administrative dashboard built with Next.js, TypeScript, and Tailwind CSS for managing ad-related records. Features a clean interface with sidebar navigation and 4-digit PIN authentication.

## Features

- **🔐 Secure Authentication**: 4-digit PIN-based login system
- **📱 Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **🎨 Modern UI**: Clean design with Shadcn/UI components
- **📊 Dashboard Overview**: Statistics and recent activity display
- **➕ Add Records**: Form validation for MAC address, name, and phone number
- **📋 View Records**: Sortable and searchable record list
- **🗑️ Delete Records**: Secure record deletion with confirmation
- **💾 Database Storage**: MongoDB integration with Prisma ORM
- **🔄 Real-time Updates**: Automatic data synchronization

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Database**: MongoDB
- **ORM**: Prisma
- **API**: RESTful API routes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   ADMIN_PIN=1234
   MONGODB_URI="your_mongodb_connection_string"
   ```
   *(Change the PIN to your preferred 4-digit code and add your MongoDB connection string)*

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Authentication

1. Open the application in your browser
2. Enter the 4-digit PIN (default: 1234)
3. Click "Login" to access the dashboard

### Managing Records

**Add New Record**:
- Navigate to "Add Record" from the sidebar
- Fill in the MAC address, name, and phone number
- Click "Add Record" to save

**View Records**:
- Navigate to "View Records" from the sidebar
- Use the search bar to filter records
- Sort by date, name, or MAC address
- Delete records using the trash icon

**Dashboard Overview**:
- View total record count and statistics
- See recent activity and newly added records

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── add/          # Add record page
│   │   ├── records/      # View records page
│   │   └── page.tsx      # Main dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Login page
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── DashboardLayout.tsx
│   ├── LoginForm.tsx
│   └── Sidebar.tsx
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── DataContext.tsx   # Data management
└── lib/
    └── utils.ts          # Utility functions
```

## Security Features

- PIN-based authentication (configurable via environment variables)
- Session persistence with localStorage
- Form validation for all inputs
- Confirmation dialogs for destructive actions
- No sensitive data in client-side code

## Validation Rules

**MAC Address**: Must follow standard format (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
**Name**: Required field, any text input
**Phone Number**: Must be at least 10 characters, supports international formats

## Database Schema

The application uses MongoDB with Prisma ORM. The Record model includes:

```prisma
model Record {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  mac       String   @unique
  phone     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Endpoints

- `GET /api/records` - Fetch all records
- `POST /api/records` - Create a new record
- `DELETE /api/records/[id]` - Delete a record
- `PUT /api/records/[id]` - Update a record

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Server-side authentication and data storage
- [ ] User roles and permissions
- [ ] Export/import functionality
- [ ] Advanced search and filtering
- [ ] Data visualization and charts
- [ ] Email notifications
- [ ] Audit logging

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio database browser

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.