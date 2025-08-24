import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

interface AlertAgency {
    name: string;
    twitter: string;
    email?: string;
    contactNumber?: string;
}

const EMERGENCY_AGENCIES: AlertAgency[] = [
    { 
        name: "NDMA India", 
        twitter: "@ndmaindia",
        email: "controlroom@ndma.gov.in",
        contactNumber: "011-26701728"
    },
    { 
        name: "NDRF HQ", 
        twitter: "@NDRFHQ",
        contactNumber: "011-23438091"
    },
    { 
        name: "Ministry of Home Affairs", 
        twitter: "@HMOIndia"
    },
    { 
        name: "Disaster Management Division", 
        twitter: "@DM_MHA"
    },
    { 
        name: "Fire Services India", 
        twitter: "@FireServiceIN",
        contactNumber: "101"
    }
];

export async function sendEmergencyAlerts(
    location: { lat: number; lng: number },
    confidence: number,
    imageUrl?: string
) {
    console.log('Sending emergency alerts for fire detection...');

    try {
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY || '',
            appSecret: process.env.TWITTER_API_SECRET || '',
            accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
            accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
        });

        // Create Google Maps link
        const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
        
        // Create mentions string
        const mentions = EMERGENCY_AGENCIES.map(agency => agency.twitter).join(' ');

        // Compose tweet with location and mentions
        const tweetText = `🚨 URGENT: Fire detected with ${confidence.toFixed(1)}% confidence.\n\nLocation: ${mapsLink}\n\nImmediate response required.\n\nCC: ${mentions}\n\n#FireAlert #EmergencyResponse #DisasterResponse`;

        // Send tweet
        const tweet = await client.v2.tweet(tweetText);
        console.log('Emergency alert tweet sent:', tweet.data.id);

        // Store alert in database for tracking
        await storeEmergencyAlert({
            tweetId: tweet.data.id,
            location,
            confidence,
            timestamp: new Date(),
            imageUrl,
            agencies: EMERGENCY_AGENCIES.map(agency => ({
                name: agency.name,
                twitter: agency.twitter
            }))
        });

        return {
            success: true,
            tweetId: tweet.data.id,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Failed to send emergency alerts:', error);
        throw error;
    }
}

async function storeEmergencyAlert(alertData: any) {
    // TODO: Implement database storage for emergency alerts
    console.log('Storing emergency alert:', alertData);
}

export function isHighPriorityFire(confidence: number, weatherConditions?: any): boolean {
    // Basic threshold for high-priority alerts
    const CONFIDENCE_THRESHOLD = 70;
    
    if (confidence >= CONFIDENCE_THRESHOLD) {
        return true;
    }

    // If weather data is available, consider additional risk factors
    if (weatherConditions) {
        const { temperature, humidity, windSpeed } = weatherConditions;
        
        // High-risk conditions: high temperature, low humidity, high wind speed
        if (temperature > 35 && humidity < 30 && windSpeed > 20) {
            return true;
        }
    }

    return false;
}
