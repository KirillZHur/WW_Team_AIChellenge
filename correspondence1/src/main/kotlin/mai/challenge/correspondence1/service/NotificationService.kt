package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Notification

interface NotificationService {

    fun getNotificationsForUser(userId: Long): List<Notification>
    fun markAsRead(id: Long)
}