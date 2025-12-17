# Secret Riddles Page - Developer Guide

## Overview
The **riddlesSecret.jsx** page is a developer-only secret page for managing riddles in the treasure hunt application.

## Features
✅ View all riddles in a beautiful tabular format with serial numbers
✅ Add new riddles with question, answer, and optional hint
✅ Edit existing riddles
✅ Delete riddles with confirmation
✅ Matches the theme of other pages (amber/treasure theme)
✅ Auto-incremental serial numbers

## Access the Page
Since this is a secret developer page, access it directly via the URL:
```
http://localhost:3000/rohan/riddlesSecret
```

## Database Schema
A new `Riddle` model has been added to the Prisma schema:
```prisma
model Riddle {
  id        Int      @id @default(autoincrement())
  question  String
  answer    String
  hint      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Backend API Endpoints
The following endpoints have been added to the backend:

- **GET** `/riddles` - Get all riddles
- **POST** `/riddles` - Create a new riddle
- **PUT** `/riddles/:id` - Update a riddle
- **DELETE** `/riddles/:id` - Delete a riddle

## Usage
1. Start the backend server (already running on port 4000)
2. Start the frontend (Next.js)
3. Navigate to `/rohan/riddlesSecret`
4. Click "Add New Riddle" to add riddles
5. Riddles will automatically be numbered as: 1, 2, 3, etc.

## Design
- Matches the treasure hunt theme with amber/gold colors
- Background image consistent with other pages
- Responsive table layout
- Smooth animations and hover effects
- Icons from Lucide React

Enjoy managing your treasure hunt riddles! 🏴‍☠️✨
