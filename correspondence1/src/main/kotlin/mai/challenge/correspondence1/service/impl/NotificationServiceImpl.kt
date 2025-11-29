package mai.challenge.correspondence.service.impl

import java.util.UUID
import mai.challenge.correspondence.entity.Notification
import mai.challenge.correspondence.repository.NotificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {

    @Transactional(readOnly = true)
    fun getNotificationsForUser(userId: UUID): List<Notification> =
        notificationRepository.findAllByUserIdAndIsRead(userId, false)

    @Transactional
    fun markAsRead(id: Long) {
        val notif = notificationRepository.findById(id)
            .orElseThrow { NotFoundException("Notification $id not found") }
        notif.isRead = true
        notificationRepository.save(notif)
    }
}