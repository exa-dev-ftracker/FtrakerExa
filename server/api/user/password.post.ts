import { defineEventHandler, readBody, getHeader } from 'h3'
import * as jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import User from '~/server/model/users'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    // Get JWT from header
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return {
        statusCode: 401,
        body: { message: 'Unauthorized' }
      }
    }

    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const userId = decoded.id

    // Get request body
    const { password } = await readBody(event)

    // Validate password
    if (!password || password.length < 6) {
      return {
        statusCode: 400,
        body: { message: 'Password must be at least 6 characters' }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user with new password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    )

    if (!updatedUser) {
      return {
        statusCode: 404,
        body: { message: 'User not found' }
      }
    }

    return {
      statusCode: 200,
      body: { 
        message: 'Password updated successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
        }
      }
    }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      statusCode: 500,
      body: { message: 'Failed to update password' }
    }
  }
})
