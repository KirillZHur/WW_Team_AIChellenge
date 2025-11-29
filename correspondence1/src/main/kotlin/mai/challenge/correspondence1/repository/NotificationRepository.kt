package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Notification
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findAllByUserIdAndIsRead(userId: UUID, isRead: Boolean): List<Notification>
}
