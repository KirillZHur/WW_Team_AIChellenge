package mai.challenge.correspondence.model

import java.time.OffsetDateTime

data class LetterCreatedDto(
    val id: Long,
    val createdAt: OffsetDateTime,
    val status: String,
)

data class LetterDto(
    val id: Long,
    val title: String,
)

data class DraftDto(
    val id: Long,
    val style: String,
    val status: String,
    val text: String?,
    val version: Int,
)