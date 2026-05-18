import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const KYC_STATUS_LABELS = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
};

const createNotifications = async (notifications) => {
  if (!notifications.length) {
    return [];
  }

  return Notification.insertMany(notifications);
};

export const notifySuperAdminsService = async ({
  actorId = null,
  action,
  title,
  message,
  entityType,
  entityId,
  metadata = {},
}) => {
  const superAdmins = await User.find({ flag: 0, status: 1 })
    .select("_id flag")
    .lean();

  return createNotifications(
    superAdmins.map((admin) => ({
      recipientId: admin._id,
      recipientFlag: admin.flag,
      actorId,
      action,
      title,
      message,
      entityType,
      entityId,
      metadata,
    }))
  );
};

export const notifyCustomerKycStatusService = async ({
  customerId,
  actorId = null,
  document,
  previousStatus,
}) => {
  const statusLabel = KYC_STATUS_LABELS[document.status] || "Updated";

  return Notification.create({
    recipientId: customerId,
    recipientFlag: 2,
    actorId,
    action: "kyc_status_updated",
    title: "KYC status updated",
    message: `Your ${document.documentType} KYC status is ${statusLabel}.`,
    entityType: "document",
    entityId: document._id,
    metadata: {
      documentType: document.documentType,
      status: document.status,
      statusLabel,
      previousStatus,
    },
  });
};

export const getNotificationsService = async ({
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false,
  action,
}) => {
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 20;
  const skip = (currentPage - 1) * perPage;

  const query = { recipientId: userId };

  if (unreadOnly === true || unreadOnly === "true" || unreadOnly === 1 || unreadOnly === "1") {
    query.isRead = false;
  }

  if (action) {
    query.action = action;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate("actorId", "name email flag")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipientId: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

export const markNotificationReadService = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

export const markAllNotificationsReadService = async (userId) => {
  const result = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};
