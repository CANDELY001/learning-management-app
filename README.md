# Learning Management System (LMS)

A modern, full-stack Learning Management System built with Next.js, TypeScript, and AWS services. This platform enables teachers to create and manage courses while providing students with an intuitive learning experience.

## 🚀 Features

### For Teachers

- **Course Management**: Create, edit, and delete courses with rich content
- **Content Creation**: Add sections, chapters, and multimedia content
- **Video Upload**: Secure video hosting with AWS S3 and CloudFront
- **Student Analytics**: Track enrollment and course progress
- **Payment Integration**: Monetize courses with Stripe payments

### For Students

- **Course Discovery**: Browse and search available courses
- **Interactive Learning**: Access video content, quizzes, and resources
- **Progress Tracking**: Monitor completion status and overall progress
- **Secure Payments**: Purchase courses with integrated Stripe checkout
- **User Dashboard**: Manage enrolled courses and billing history

## 🛠 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **RTK Query** - Data fetching and caching
- **Clerk** - Authentication and user management
- **Shadcn/ui** - Modern UI components

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe server development
- **AWS SDK v3** - Cloud services integration

### Cloud Services (AWS)

- **DynamoDB** - NoSQL database for courses, users, and progress
- **S3** - Object storage for videos and images
- **CloudFront** - CDN for fast content delivery
- **IAM** - Access management and security

### Payment Processing

- **Stripe** - Secure payment processing and subscriptions

## 📁 Project Structure

```
Learning-management-app/
├── client/                 # Frontend Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and schemas
│   │   ├── state/         # Redux store and API slice
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Express.js application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # TypeScript type definitions
│   │   ├── routes/        # API route definitions
│   │   ├── seed/          # Database seeding scripts
│   │   └── utils/         # Helper functions
│   ├── .env               # Environment variables
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account with configured services
- Stripe Account for payments
- Clerk Account for authentication

### Environment Setup

#### Server (.env)

```env
PORT=8001
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
CLOUDFRONT_DOMAIN=https://your-cloudfront-domain

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

#### Client (.env.local)

```env
NEXT_PUBLIC_LOCAL_URL=localhost:3000
NEXT_PUBLIC_VERCEL_URL=your-vercel-deployment-url
```

### Installation & Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/CANDELY001/learning-management-app.git
   cd learning-management-app
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure AWS Services**

   - Set up DynamoDB tables: `Courses`, `UserCourseProgress`, `Transaction`
   - Configure S3 bucket for video storage
   - Set up CloudFront distribution
   - Configure IAM roles and permissions

4. **Start development servers**

   ```bash
   # Start backend server (port 8001)
   cd server
   npm run dev

   # Start frontend development server (port 3000)
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

## 🗄️ Database Schema

### DynamoDB Tables

#### Courses Table

- **Primary Key**: `courseId` (String)
- **Attributes**: teacherId, teacherName, title, description, category, image, price, level, status, sections, enrollments

#### UserCourseProgress Table

- **Primary Key**: `userId` (String)
- **Sort Key**: `courseId` (String)
- **Attributes**: enrollmentDate, overallProgress, sections, lastAccessedTimestamp

#### Transaction Table

- **Primary Key**: `userId` (String)
- **Sort Key**: `transactionId` (String)
- **Global Secondary Index**: CourseTransactionsIndex (courseId)
- **Attributes**: dateTime, paymentProvider, amount

## 🔐 Authentication & Authorization

- **User Authentication**: Managed by Clerk with support for email/password and social logins
- **Role-based Access**: Teachers and students have different permissions
- **Protected Routes**: API endpoints secured with Clerk middleware
- **Session Management**: Automatic token refresh and secure session handling

## 💳 Payment Integration

- **Stripe Integration**: Secure payment processing for course purchases
- **Payment Intent**: Server-side payment intent creation
- **Webhook Support**: Real-time payment status updates
- **Transaction History**: Complete billing and payment tracking

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (AWS/Railway/Heroku)

```bash
cd server
npm run build
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**CANDELY001**

- GitHub: [@CANDELY001](https://github.com/CANDELY001)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [AWS](https://aws.amazon.com/) for cloud infrastructure
- [Stripe](https://stripe.com/) for payment processing
- [Clerk](https://clerk.com/) for authentication services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/ui](https://ui.shadcn.com/) for UI components

---

⭐ Star this repository if you find it helpful!
