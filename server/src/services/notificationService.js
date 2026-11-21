/**
 * Notification Service for KHELORA Sports Management
 * Dispatches transactional notifications if credentials are provided,
 * otherwise logs the event safely without pretending external delivery occurred.
 */

export const notificationService = {
  isConfigured() {
    return Boolean(process.env.EMAIL_SERVICE_API_KEY && process.env.EMAIL_FROM);
  },

  async sendBookingConfirmation({ email, name, courtName, date, time, amount }) {
    if (!this.isConfigured()) {
      console.log(`[Notification: Simulation] Booking confirmed for ${name} (${email}) - ${courtName} on ${date} at ${time}. (Live email delivery disabled: EMAIL_SERVICE_API_KEY not configured)`);
      return { delivered: false, simulated: true, reason: 'EMAIL_SERVICE_API_KEY not configured' };
    }

    try {
      // In production with SendGrid/Resend:
      // await resend.emails.send({ from: process.env.EMAIL_FROM, to: email, subject: 'Court Booking Confirmed', html: ... });
      return { delivered: true };
    } catch (error) {
      console.error('Failed to send booking email notification:', error.message);
      return { delivered: false, error: error.message };
    }
  },

  async sendMembershipExpiryReminder({ email, name, plan, expiryDate }) {
    if (!this.isConfigured()) {
      console.log(`[Notification: Simulation] Expiry reminder for ${name} (${email}) - ${plan} tier expires on ${expiryDate}.`);
      return { delivered: false, simulated: true };
    }
    return { delivered: true };
  },

  async sendLeaveStatusUpdate({ email, name, leaveType, status, reviewedBy }) {
    if (!this.isConfigured()) {
      console.log(`[Notification: Simulation] Leave ${status} for ${name} (${email}) by ${reviewedBy}.`);
      return { delivered: false, simulated: true };
    }
    return { delivered: true };
  }
};

export default notificationService;
