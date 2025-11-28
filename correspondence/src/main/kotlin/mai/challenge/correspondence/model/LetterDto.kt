package mai.challenge.correspondence.model

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import java.time.OffsetDateTime

data class LetterSummaryDto(
    val id: Long,
    val sender: String?,
    val subject: String?,
    val status: LetterStatus,
    val slaAt: OffsetDateTime?,
    val createdAt: OffsetDateTime
)

data class LetterDetailsDto(
    val id: Long,
    val sender: String?,
    val subject: String?,
    val body: String?,
    val status: LetterStatus,
    val slaAt: OffsetDateTime?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

fun Letter.toSummaryDto() = LetterSummaryDto(
    id = id,
    sender = sender,
    subject = subject,
    status = status,
    slaAt = slaAt,
    createdAt = createdAt
)

fun Letter.toDetailsDto() = LetterDetailsDto(
    id = id,
    sender = sender,
    subject = subject,
    body = body,
    status = status,
    slaAt = slaAt,
    createdAt = createdAt,
    updatedAt = updatedAt
)

data class CreateLetterRequest(
    val sender: String,
    val subject: String,
    val body: String,
    val slaAt: OffsetDateTime? = null
)

data class CreateLetterResponse(
    val id: Long,
    val status: String
)