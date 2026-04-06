import Notification from '../models/notification.model.js';

export const createNotification = async (recipientId, senderId, message, type) => {
  try {
    const newNotification = new Notification({
      recipientId,
      senderId,
      message,
      type,
    });
    await newNotification.save();
  } catch (error) {
    console.log("Gagal membuat notifikasi:", error);
  }
};