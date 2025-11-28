package mai.challenge.correspondence.controller

import mai.challenge.correspondence.model.CreateDraftRequest
import mai.challenge.correspondence.model.DraftDetailsDto
import mai.challenge.correspondence.model.SubmitDraftResponse
import mai.challenge.correspondence.model.UpdateDraftRequest
import mai.challenge.correspondence.model.toDetailsDto
import mai.challenge.correspondence.model.toSummaryDto
import mai.challenge.correspondence.service.DraftService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api/v1")
class DraftController(
    private val draftService: DraftService
) {

    @GetMapping("/letters/{letterId}/drafts")
    fun getDraftsForLetter(@PathVariable letterId: Long) =
        draftService.getDraftsForLetter(letterId)
            .map { it.toSummaryDto() }

    @PostMapping("/letters/{letterId}/drafts")
    fun createDraft(
        @PathVariable letterId: Long,
        @RequestBody req: CreateDraftRequest,
        principal: Principal
    ): DraftDetailsDto {
        val draft = draftService.createDraftFromLlm(
            letterId = letterId,
            style = req.style,
            createdBy = principal.name
        )
        return draft.toDetailsDto()
    }

    @GetMapping("/drafts/{draftId}")
    fun getDraft(@PathVariable draftId: Long) =
        draftService.getDraft(draftId).toDetailsDto()

    @PutMapping("/drafts/{draftId}")
    fun updateDraft(
        @PathVariable draftId: Long,
        @RequestBody req: UpdateDraftRequest,
        principal: Principal
    ): DraftDetailsDto {
        val updated = draftService.updateDraft(
            draftId = draftId,
            newText = req.text,
            expectedVersion = req.version,
            updatedBy = principal.name
        )
        return updated.toDetailsDto()
    }

    @PostMapping("/drafts/{draftId}/submit")
    fun submitDraft(
        @PathVariable draftId: Long,
        principal: Principal
    ): SubmitDraftResponse {
        val draft = draftService.submitForReview(draftId, principal.name)
        return SubmitDraftResponse(
            id = draft.id,
            status = draft.status
        )
    }

    @PostMapping("/drafts/{draftId}/send")
    fun sendDraft(
        @PathVariable draftId: Long,
        principal: Principal
    ): DraftDetailsDto {
        val draft = draftService.sendDraftAsAnswer(draftId, principal.name)
        return draft.toDetailsDto()
    }
}
