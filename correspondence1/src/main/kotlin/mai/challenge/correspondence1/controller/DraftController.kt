package mai.challenge.correspondence.controller

import mai.challenge.correspondence.mapper.DraftStyleMapper
import mai.challenge.correspondence.model.DraftDetailsDto
import mai.challenge.correspondence.model.DraftDto
import mai.challenge.correspondence.model.UpdateDraftTextRequest
import mai.challenge.correspondence.model.toDetailsDto
import mai.challenge.correspondence.service.AuthService
import mai.challenge.correspondence.service.DraftService
import org.springframework.http.ResponseEntity
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
    private val draftService: DraftService,
    private val authService: AuthService
) : BaseAuthController(authService){

    @GetMapping("/letters/{letterId}/drafts")
    fun getDraftsForLetter(@PathVariable letterId: Long) =
        ResponseEntity.ok(draftService.getDraftsForLetter(letterId))


    @PutMapping("/drafts/{draftId}")
    fun updateDraft(
        @PathVariable draftId: Long,
        @RequestBody body: UpdateDraftTextRequest,
    ): ResponseEntity<DraftDto> {
        val user = currentUser()
        val draft = draftService.updateText(
            draftId = draftId,
            newText = body.text,
            user = user
        )

        val dto = DraftDto(
            id = draft.id!!,
            style = DraftStyleMapper.toApi(draft.style),
            status = draft.status.name,
            text = draft.text,
            version = draft.version
        )

        return ResponseEntity.ok(dto)
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
