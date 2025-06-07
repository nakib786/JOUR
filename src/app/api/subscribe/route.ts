import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, turnstileToken } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Security verification is required' },
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

    // Verify Turnstile token
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
        remoteip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      }),
    });

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
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

    // Get IP address for location lookup
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Get approximate location from IP address
    let locationData = {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'Unknown',
      latitude: null,
      longitude: null,
    };

    if (ipAddress !== 'unknown' && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      try {
        // Using ipapi.co for free IP geolocation (1000 requests/day free)
        const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (locationResponse.ok) {
          const locationJson = await locationResponse.json();
          locationData = {
            country: locationJson.country_name || 'Unknown',
            region: locationJson.region || 'Unknown',
            city: locationJson.city || 'Unknown',
            timezone: locationJson.timezone || 'Unknown',
            latitude: locationJson.latitude || null,
            longitude: locationJson.longitude || null,
          };
        }
      } catch (error) {
        console.log('Location lookup failed:', error);
        // Continue with unknown location data
      }
    }

    // Add subscriber to database
    const subscriberData = {
      email: email.toLowerCase(),
      subscribedAt: serverTimestamp(),
      isActive: true,
      source: 'footer_subscription',
      ipAddress: ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      location: locationData,
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