package mai.challenge.correspondence.model

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle
import java.time.OffsetDateTime

data class DraftSummaryDto(
    val id: Long,
    val style: DraftStyle,
    val text: String,
)

data class GetDraftsResponse(
    val drafts: List<DraftSummaryDto>,
    val title: String,
    val type: String? = null,
    val quickly: Boolean = false,
    val summary: String? = null,
    val approvers: List<String>? = listOf()
)

data class DraftDetailsDto(
    val id: Long,
    val style: DraftStyle,
    val status: DraftStatus,
    val text: String?,
    val version: Int,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

data class UpdateDraftTextRequest(
    val text: String
)

fun Draft.toDetailsDto() = DraftDetailsDto(
    id = id,
    style = style,
    status = status,
    text = text,
    version = version,
    createdAt = createdAt,
    updatedAt = updatedAt
)