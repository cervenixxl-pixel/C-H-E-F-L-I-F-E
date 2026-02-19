import { User, Booking } from '../types';

export const sendConfirmationEmail = async (user: User, booking: Booking, aiMessage: string): Promise<void> => {
  // Simulate network latency for email service provider
  console.log(`Preparing to send email to ${user.email}...`);
  await new Promise(resolve => setTimeout(resolve, 1500));

  const emailContent = `
==================================================================
📧 EMAIL SENT (SIMULATION)
------------------------------------------------------------------
From:    notifications@luxeplate.com
To:      ${user.name} <${user.email}>
Subject: Booking Confirmed: ${booking.menuName} with Chef ${booking.chefName}
------------------------------------------------------------------

Dear ${user.name},

${aiMessage}

HERE ARE YOUR BOOKING DETAILS:
------------------------------------------------------------------
👨‍🍳 Chef:    ${booking.chefName}
🍽️ Menu:    ${booking.menuName}
📅 Date:    ${booking.date}
⏰ Time:    ${booking.time}
👥 Guests:  ${booking.guests} people
💰 Total:   $${booking.totalPrice}
------------------------------------------------------------------

Your private chef will be in touch shortly to discuss any dietary 
requirements or specific requests.

You can view and manage your booking at any time by logging into 
your LuxePlate profile.

Bon Appétit!
The LuxePlate Team

==================================================================
`;

  console.log(emailContent);
};