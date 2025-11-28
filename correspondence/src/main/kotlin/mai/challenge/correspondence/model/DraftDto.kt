package mai.challenge.correspondence.model

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftSource
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle
import java.time.OffsetDateTime

data class DraftSummaryDto(
    val id: Long,
    val style: DraftStyle,
    val status: DraftStatus,
    val version: Int,
    val updatedAt: OffsetDateTime
)

data class DraftDetailsDto(
    val id: Long,
    val letterId: Long,
    val style: DraftStyle,
    val status: DraftStatus,
    val source: DraftSource,
    val text: String?,
    val version: Int,
    val createdBy: String,
    val updatedBy: String?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

data class CreateDraftRequest(
    val style: DraftStyle
)

data class UpdateDraftRequest(
    val text: String,
    val version: Int
)

data class SubmitDraftResponse(
    val id: Long,
    val status: DraftStatus
)

fun Draft.toSummaryDto() = DraftSummaryDto(
    id = id,
    style = style,
    status = status,
    version = version,
    updatedAt = updatedAt
)

fun Draft.toDetailsDto() = DraftDetailsDto(
    id = id,
    letterId = letter.id,
    style = style,
    status = status,
    source = source,
    text = text,
    version = version,
    createdBy = createdBy,
    updatedBy = updatedBy,
    createdAt = createdAt,
    updatedAt = updatedAt
)