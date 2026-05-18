import {
  getNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await getNotificationsService({
      userId,
      ...req.body,
      ...req.query,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id || req.body.notificationId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!notificationId) {
      return res.status(400).json({ message: "Notification id is required" });
    }

    const notification = await markNotificationReadService(notificationId, userId);

    res.json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await markAllNotificationsReadService(userId);

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
