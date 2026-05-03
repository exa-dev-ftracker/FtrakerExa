import Users from "~/server/model/users";
import { extractPhoneFromBaileys } from "~/server/utils/phoneValidator";
import logger from "~/server/utils/logger";

/**
 * WhatsApp message handler for Baileys integration
 * Processes incoming WhatsApp messages and determines if they should be processed
 */

export interface WhatsAppMessage {
  sender: string; // e.g., "628123456789@s.whatsapp.net"
  content: string;
  timestamp: number;
}

export interface MessageProcessingResult {
  shouldProcess: boolean;
  userId?: string;
  reason?: string;
  phoneNumber?: string;
}

/**
 * Main handler for incoming WhatsApp messages
 * Checks if the message should be processed based on user settings
 *
 * @param message - WhatsApp message from Baileys
 * @returns Processing result indicating whether to process the message
 */
export async function handleWhatsAppMessage(
  message: WhatsAppMessage
): Promise<MessageProcessingResult> {
  try {
    // Step 1: Extract sender phone number from Baileys format
    const phoneNumber = extractPhoneFromBaileys(message.sender);

    if (!phoneNumber) {
      logger.warn(`Invalid phone number format from Baileys: ${message.sender}`);
      return {
        shouldProcess: false,
        reason: "Invalid phone number format",
      };
    }

    // Step 2: Find user with matching phone number
    const user = await Users.findOne({ phone_number: phoneNumber });

    if (!user) {
      logger.debug(`No user found for phone number: ${phoneNumber}`);
      return {
        shouldProcess: false,
        reason: "User not found",
        phoneNumber,
      };
    }

    // Step 3: Check if chatbot is enabled for this user
    if (!user.chatbot_enabled) {
      logger.debug(`Chatbot disabled for user: ${user._id}`);
      return {
        shouldProcess: false,
        reason: "Chatbot disabled by user",
        userId: user.id.toString(),
        phoneNumber,
      };
    }

    // Step 4: Message should be processed
    logger.info(`Processing WhatsApp message from user ${user._id}`);
    return {
      shouldProcess: true,
      userId: user.id.toString(),
      phoneNumber,
      reason: "Message will be processed",
    };
  } catch (error) {
    logger.error(`Error in WhatsApp message handler: ${(error as Error).message}`);
    return {
      shouldProcess: false,
      reason: "Error processing message",
    };
  }
}

/**
 * Validates if a message is a valid transaction command
 * Can be extended with more complex parsing logic
 *
 * Example formats:
 * - "expense 50000 coffee"
 * - "income 1000000 salary"
 * - "e 25000 lunch"
 * - "i 500000 freelance"
 */
export function isValidTransactionMessage(content: string): {
  isValid: boolean;
  type?: string;
  amount?: number;
  description?: string;
  error?: string;
} {
  try {
    const trimmed = content.trim().toLowerCase();

    // Regex pattern: [expense/income/e/i] [amount] [description...]
    const pattern = /^(expense|income|e|i)\s+(\d+(?:[.,]\d+)?)\s+(.+)$/;
    const match = trimmed.match(pattern);

    if (!match) {
      return {
        isValid: false,
        error: "Invalid format. Use: 'expense 50000 description' or 'income 1000000 description'",
      };
    }

    const [_, typeInput, amountInput, description] = match;

    // Normalize type
    const type = (typeInput === 'e' ? 'expense' : typeInput === 'i' ? 'income' : typeInput).toLowerCase();

    // Parse amount (handle both . and , as decimal separator)
    const amount = parseInt(amountInput.replace(/[.,]/g, ''), 10);

    if (isNaN(amount) || amount <= 0) {
      return {
        isValid: false,
        error: "Amount must be a valid positive number",
      };
    }

    if (!description || description.trim().length === 0) {
      return {
        isValid: false,
        error: "Description is required",
      };
    }

    return {
      isValid: true,
      type,
      amount,
      description: description.trim(),
    };
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Formats a response message for the user
 * This message is typically sent back to WhatsApp
 */
export function formatResponseMessage(
  success: boolean,
  type: string,
  amount?: number,
  description?: string,
  error?: string
): string {
  if (!success) {
    return `❌ Error: ${error || 'Failed to process transaction'}\n\nFormat:\n*expense* 50000 coffee\n*income* 1000000 salary`;
  }

  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  const formattedAmount = amount?.toLocaleString('id-ID') || '0';

  return `✅ ${capitalizedType} recorded\n💰 Rp ${formattedAmount}\n📝 ${description}`;
}

