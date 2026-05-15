import { Linking, Platform } from 'react-native';

export interface NotificationPayload {
  phoneNumber: string;
  message: string;
}

/**
 * Opens WhatsApp with a pre-filled message for a specific contact.
 */
export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
  const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to SMS if WhatsApp is not installed
      return sendSMSMessage(phoneNumber, message);
    }
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    return sendSMSMessage(phoneNumber, message);
  }
};

/**
 * Opens the system SMS app with a pre-filled message and recipient.
 */
export const sendSMSMessage = async (phoneNumber: string, message: string) => {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${phoneNumber}${separator}body=${encodeURIComponent(message)}`;
  
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to open SMS:', error);
    return false;
  }
};

/**
 * Generates a standard commute tracking message.
 */
export const generateCommuteMessage = (routeName: string, eta: string, sessionId: string) => {
  const dashboardUrl = `https://reachsafe-track.vercel.app/session/${sessionId}`;
  
  return `🛡️ ReachSafe Live Tracking: I'm starting my commute from ${routeName}. 

📱 Live Dashboard: ${dashboardUrl}
🕒 Expected Arrival: ${eta}

Stay updated on my journey!`;
};
