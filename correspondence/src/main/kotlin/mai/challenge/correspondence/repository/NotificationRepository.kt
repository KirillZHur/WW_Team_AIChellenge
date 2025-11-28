package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Notification
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findAllByUserIdAndIsRead(userId: Long, isRead: Boolean): List<Notification>
}
