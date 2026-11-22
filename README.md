# Equipora – Equipment Rental Platform

Equipora is a full-stack equipment rental platform where users can rent equipment for their personal and professional needs. Equipment owners can list their products, manage rental requests, and track their earnings. Admins can manage users, equipment, and rental activities through a dedicated dashboard.

## Live Website

**Live URL:** [Add your deployed frontend URL here]

## Main Features

- User registration and login with email and password.
- Google authentication support.
- Role-based dashboards for Customers, Owners, and Admins.
- Browse and search approved equipment.
- Filter equipment by category, rental type, and price.
- View detailed equipment information.
- Owners can add, update, and delete equipment listings.
- Customers can book equipment and make payments using Stripe.
- Secure payment verification through Stripe Webhooks.
- Customers can manage their rental bookings.
- Owners can approve or reject rental requests.
- Owners can mark completed rentals.
- Admins can manage users, equipment, and bookings.
- Admin and Owner dashboards include analytics.
- Responsive design for mobile, tablet, and desktop devices.

## Technologies Used

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Better Auth
- JSON Web Token (JWT)
- Stripe

## Installation and Setup

### 1. Clone the Frontend Repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
cd equipora-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the frontend root directory:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup

Clone the backend repository separately:

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd equipora-server
npm install
```

Configure the required environment variables in the backend `.env` file, including MongoDB, Better Auth, Stripe, and frontend URL settings.

Start the backend:

```bash
npm run dev
```

## Payment Information

Equipora uses Stripe Checkout for payment processing. Payments have been tested using Stripe Test Mode.

## Project Purpose

The purpose of Equipora is to make equipment rental easier and more accessible by connecting equipment owners with customers through a secure and user-friendly platform.