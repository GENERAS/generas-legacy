// src/utils/reminderService.js
import { supabase } from '../lib/supabase';
import { sendPaymentReminderEmail } from './emailService';

// Check for pending payments and send reminders
export const checkPendingPayments = async () => {
  try {
    // Get applications pending payment for more than 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: pendingApps, error } = await supabase
      .from('mentorship_applications')
      .select('*')
      .eq('payment_status', 'pending_payment')
      .lt('submitted_at', twentyFourHoursAgo.toISOString())
      .eq('email_sent', false);
    
    if (error) throw error;
    
    for (const app of pendingApps) {
      // Send reminder email
      await sendPaymentReminderEmail({
        email: app.email,
        full_name: app.full_name,
        service_title: app.service_title,
        amount: app.payment_amount,
        reference_code: app.application_id
      });
      
      // Mark reminder as sent
      await supabase
        .from('mentorship_applications')
        .update({ email_sent: true })
        .eq('id', app.id);
      
      console.log(`Reminder sent to ${app.email}`);
    }
    
    return { success: true, count: pendingApps.length };
  } catch (error) {
    console.error('Reminder error:', error);
    return { success: false, error: error.message };
  }
};

// Run this every hour (can be set up as cron job)
export const startReminderScheduler = () => {
  // Check immediately
  checkPendingPayments();
  
  // Check every hour
  setInterval(() => {
    checkPendingPayments();
  }, 60 * 60 * 1000);
};