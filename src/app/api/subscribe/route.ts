import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const subscribersRef = collection(db, 'subscribers');
    const existingSubscriber = query(subscribersRef, where('email', '==', email.toLowerCase()));
    const existingDocs = await getDocs(existingSubscriber);

    if (!existingDocs.empty) {
      return NextResponse.json(
        { error: 'Email is already subscribed' },
        { status: 409 }
      );
    }

    // Add subscriber to database
    const subscriberData = {
      email: email.toLowerCase(),
      subscribedAt: serverTimestamp(),
      isActive: true,
      source: 'footer_subscription',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    const docRef = await addDoc(subscribersRef, subscriberData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter!',
        subscriberId: docRef.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 