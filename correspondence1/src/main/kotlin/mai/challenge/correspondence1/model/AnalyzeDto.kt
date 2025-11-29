package mai.challenge.correspondence.client

import com.fasterxml.jackson.annotation.JsonProperty

data class AnalyzePdfRequest(
    val text: String
)

data class AnalyzePdfDraftDto(
    val style: String,
    val text: String
)

data class AnalyzePdfResponse(
    @JsonProperty("letter_type") val letterType: String,
    val facts: Map<String, Object>,
    val summary: String,
    val drafts: List<AnalyzePdfDraftDto>
)
