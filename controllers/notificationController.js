import { readNotifications } from "../index.js";

export const getNotification = (req, res) => {
  readNotifications((err, notifications) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading notifications' });
    }

    res.status(200).json(notifications);
  });
};
