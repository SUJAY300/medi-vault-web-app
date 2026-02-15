/**
 * Database configuration - MongoDB only
 * This file is kept for backward compatibility but now uses MongoDB
 */

import connectDB from "./mongodb"
import User from "../models/User"
import OtpSession from "../models/OtpSession"

export { connectDB, User, OtpSession }
