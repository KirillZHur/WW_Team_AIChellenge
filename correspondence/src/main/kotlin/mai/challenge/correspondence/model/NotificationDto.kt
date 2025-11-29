package mai.challenge.correspondence.model

import mai.challenge.correspondence.entity.Notification
import java.time.OffsetDateTime

data class NotificationDto(
    val id: Long,
    val message: String,
    val isRead: Boolean,
    val createdAt: OffsetDateTime
)

fun Notification.toDto() = NotificationDto(
    id = id,
    message = message,
    isRead = isRead,
    createdAt = createdAt
)
