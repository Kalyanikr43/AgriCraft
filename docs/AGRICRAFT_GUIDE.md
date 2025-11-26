# AgriCraft Platform Guide

## Overview

AgriCraft is an innovative platform that empowers farmers to transform agricultural waste into valuable handmade products while connecting them with environmentally conscious buyers. The platform features AI-powered waste classification, a product marketplace, and direct communication between farmers and buyers.

## Key Features

### 🌱 For Farmers
- **AI-Powered Waste Classification**: Upload images of agricultural waste (coconut shell, banana stem, rice husk) and receive instant AI classification
- **Step-by-Step Guidance**: Get detailed instructions on how to create handmade products from classified waste
- **Product Listing**: Create and manage product listings with images, descriptions, and pricing
- **Direct Buyer Contact**: Receive inquiries directly from interested buyers

### 🛒 For Buyers
- **Marketplace**: Browse a curated collection of handmade products made from agricultural waste
- **Search & Filter**: Find products by material type, price range, and keywords
- **Direct Communication**: Contact farmers directly to discuss products and arrange purchases
- **Eco-Friendly Shopping**: Support sustainable practices and local artisans

### 👨‍💼 For Administrators
- **User Management**: View and manage all registered users
- **Role Assignment**: Assign and modify user roles (Farmer, Buyer, Admin)
- **Platform Monitoring**: Track products, feedback, and platform activity
- **Feedback Review**: Read and respond to user feedback

## User Flows

### Farmer Journey
1. **Sign Up/Login**: Create an account or log in with username and password
2. **Upload Waste**: Take a photo of agricultural waste and upload it
3. **AI Classification**: Receive instant classification and confidence level
4. **View Guidance**: Read step-by-step instructions for creating products
5. **Create Listing**: Upload product photo, add details, set price, and provide contact info
6. **Manage Products**: View, edit, or delete your product listings

### Buyer Journey
1. **Browse Marketplace**: Explore products without needing to log in
2. **Search & Filter**: Use filters to find specific products by material or price
3. **View Details**: Click on products to see full descriptions and images
4. **Contact Farmer**: Click "Contact Farmer to Buy" to reveal phone number
5. **Direct Purchase**: Contact farmer directly to arrange purchase and delivery

### Admin Journey
1. **Access Dashboard**: Navigate to /admin (admin role required)
2. **View Statistics**: See total users, products, and feedback
3. **Manage Users**: View all users and modify their roles
4. **Review Feedback**: Read user feedback and suggestions
5. **Monitor Activity**: Track platform usage and product listings

## Technical Features

### Authentication System
- Username-based authentication (no email required)
- Usernames automatically converted to email format (@miaoda.com)
- First registered user automatically becomes admin
- Role-based access control (Farmer, Buyer, Admin)
- Secure password storage with Supabase Auth

### AI Integration
- Large Language Model API for waste classification
- Supports three waste types: Coconut shell, Banana stem, Rice husk
- Provides confidence levels and detailed guidance
- Streaming responses for real-time feedback

### Image Management
- Automatic image compression (max 1MB)
- Converts images to WebP format for optimal performance
- Validates file types and names
- Secure storage with Supabase Storage
- Public access to product images

### Database Structure
- **profiles**: User information and roles
- **products**: Product listings with images and details
- **waste_classifications**: History of AI classifications
- **feedback**: User feedback and suggestions

### Design System
- Earth-tone color palette (forest greens, warm browns, soft beige)
- Natural, human-made aesthetic
- Fully responsive design (mobile and desktop)
- Meesho-style grid layout for marketplace
- Accessible and user-friendly interface

## Getting Started

### For New Users
1. Visit the homepage
2. Click "I'm a Farmer" or "I'm a Buyer"
3. Create an account with a username and password
4. Start using the platform immediately

### For Farmers
1. Click "I'm a Farmer" on the homepage
2. Upload a photo of your agricultural waste
3. Wait for AI classification (takes 10-30 seconds)
4. Review the step-by-step guidance
5. Create your product listing
6. Your product appears in the marketplace automatically

### For Buyers
1. Click "I'm a Buyer" on the homepage
2. Browse products in the marketplace
3. Use search and filters to find specific items
4. Click on products to view details
5. Contact farmers directly to purchase

## Support & Feedback

### Providing Feedback
1. Navigate to the Feedback page
2. Optionally provide your name and email
3. Write your feedback, suggestions, or report issues
4. Submit your feedback
5. Admins will review all submissions

### Contact Information
- Farmers can be contacted directly through product listings
- Platform feedback can be submitted through the Feedback page
- Admins can view all feedback in the Admin Dashboard

## Best Practices

### For Farmers
- Take clear, well-lit photos of your waste and products
- Provide detailed product descriptions
- Set competitive prices
- Respond promptly to buyer inquiries
- Keep your contact information up to date

### For Buyers
- Read product descriptions carefully
- Contact farmers with specific questions
- Support local artisans and sustainable practices
- Provide feedback on your experience

### For Administrators
- Regularly review user feedback
- Monitor platform activity
- Assign appropriate roles to users
- Maintain a positive community environment

## Security & Privacy

- Secure authentication with Supabase
- Password encryption and secure storage
- Role-based access control
- Public marketplace (no login required for browsing)
- Private admin dashboard
- Secure image storage and delivery

## Platform Statistics

Track key metrics in the Admin Dashboard:
- Total registered users
- Total products listed
- Feedback submissions
- User role distribution
- Recent platform activity

---

**AgriCraft** - Transforming agricultural waste into valuable products, one handmade creation at a time. 🌱
