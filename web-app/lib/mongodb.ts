import mongoose from 'mongoose';

/**
 * MongoDB connection manager with connection pooling and hot reload support
 * Implements singleton pattern to prevent multiple connections in development
 */

// Type definition for mongoose connection cache
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend NodeJS global interface for TypeScript support
declare global {
    var mongoose: MongooseCache | undefined;
}

// Environment variable validation
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

// Initialize connection cache
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Establishes and manages MongoDB connection with connection pooling
 * @returns Promise<typeof mongoose> - Connected mongoose instance
 * @throws Error if connection fails or MONGODB_URI is missing
 */
async function connectDB(): Promise<typeof mongoose> {
    // Return existing connection if available and connected
    if (cached.conn && cached.conn.connection.readyState === 1) {
        return cached.conn;
    }

    // Create new connection if no pending connection exists
    if (!cached.promise) {
        const options: mongoose.ConnectOptions = {
            bufferCommands: false, // Disable mongoose buffering
            maxPoolSize: 10, // Maximum number of sockets in connection pool
            serverSelectionTimeoutMS: 5000, // Timeout for server selection
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        cached.promise = mongoose.connect(MONGODB_URI!, options)
            .then((mongooseInstance) => {
                console.log('✅ MongoDB connected successfully');
                return mongooseInstance;
            })
            .catch((error) => {
                // Reset promise on connection failure to allow retry
                cached.promise = null;
                console.error('❌ MongoDB connection error:', error);
                throw error;
            });
    }

    try {
        // Wait for connection to establish
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

// Connection events handlers for better error handling
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

export default connectDB;