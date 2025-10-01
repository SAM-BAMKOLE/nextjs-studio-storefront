# E-commerce Storefront Manager

This is a full-stack e-commerce application built with Next.js, Firebase, and Genkit. It provides a complete storefront for customers and a powerful admin dashboard for store owners to manage products, orders, and gain AI-powered insights into sales data.

## Key Features

- **Customer-Facing Storefront**:
  - Browse and view product listings.
  - Add products to a persistent shopping cart.
  - User authentication (Sign up, Log in, Log out).
  - Place orders and view personal order history.
- **Admin Dashboard**:
  - Secure admin area accessible only to users with the 'admin' role.
  - **Sales Dashboard**: View key metrics like total revenue, orders, and customer count.
  - **AI-Powered Insights**: Use a Genkit-powered tool to ask natural language questions about your sales data.
  - **Product Management**: Create, read, update, and delete products in the store inventory.
  - **Order Management**: View all customer orders and update their status (e.g., Pending, Shipped).
- **Secure by Design**:
  - Role-based access control (RBAC) for distinguishing between regular users and administrators.
  - Server-side logic for sensitive operations (though currently configured for client-side stock updates per recent changes).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (for sales data analysis)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- An active [Firebase Project](https://console.firebase.google.com/).

### Firebase Configuration

1.  Create a Firebase project if you haven't already.
2.  In your project, create a new Web App.
3.  Copy the Firebase configuration object provided.
4.  Create a `.env` file in the root of this project and populate it with your Firebase credentials. The `src/lib/firebase.ts` file is set up to use these environment variables.

Your `.env` file should look like this:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Firestore Security Rules

To ensure the application functions correctly, you need to set up Firestore Security Rules. The current setup requires client-side permissions for updating product stock during checkout.

Go to your **Firebase Console -> Firestore Database -> Rules** and paste the following:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow create, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null;
    }

    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update: if request.auth != null && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || resource.data.userId == request.auth.uid);
    }
    
    match /users/{userId} {
       allow create: if request.auth != null && request.auth.uid == userId;
       allow read, write: if request.auth != null && request.auth.uid == userId;
       allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```
**Warning**: The `products` update rule is permissive for demonstration purposes. In a production environment, stock updates should be handled by a secure backend service (e.g., a Cloud Function or a secure Genkit flow).

### Creating an Admin User

By default, all new users are assigned the `user` role. To create an admin:
1.  Sign up a new user in the application.
2.  Go to your Firestore database in the Firebase Console.
3.  Navigate to the `users` collection and find the document for the new user.
4.  Change the `role` field from `"user"` to `"admin"`.

### Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the project files.