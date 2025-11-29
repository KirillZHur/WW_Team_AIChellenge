package mai.challenge.correspondence.service.impl

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper
import mai.challenge.correspondence.repository.LetterRepository
import mai.challenge.correspondence.repository.DraftRepository
import mai.challenge.correspondence.config.client.LlmClient
import mai.challenge.correspondence.config.client.MailClient
import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.exception.BackendException
import mai.challenge.correspondence.model.DraftSummaryDto
import mai.challenge.correspondence.model.GetDraftsResponse
import mai.challenge.correspondence.service.WorkflowService
import mai.challenge.correspondence.service.DraftService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class DraftServiceImpl(
    private val letterRepository: LetterRepository,
    private val draftRepository: DraftRepository,
    private val objectMapper: ObjectMapper,
    private val workflowService: WorkflowService,
    private val mailClient: MailClient
) : DraftService {

    private val LOGGER = LoggerFactory.getLogger(LetterServiceImpl::class.java)

    @Transactional(readOnly = true)
    override fun getDraftsForLetter(letterId: Long): GetDraftsResponse {
        val letter = letterRepository.findById(letterId).orElseThrow {
            BackendException(statusCode = HttpStatus.NOT_FOUND, "Letter $letterId not found")
        }

        return GetDraftsResponse(
            type = letter.type,
            title = letter.title,
            summary = letter.summary,
            approvers = letter.approvers?.map{ it.name }  ?: emptyList(),
            drafts = letter.drafts?.map { DraftSummaryDto(id = it.id, style = it.style, text = it.text) } ?: emptyList(),
            quickly = letter.quickly,
            facts = convertToMap(letter.facts)
        )
    }

    @Transactional(readOnly = true)
    override fun getDraft(draftId: Long): Draft =
        draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }

    @Transactional
    override fun submitForReview(draftId: Long, userId: String): Draft {
        val draft = draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }

        if (draft.status != DraftStatus.EDITABLE) {
            throw IllegalStateException("Draft is not editable")
        }

        draft.status = DraftStatus.ON_REVIEW
        draft.updatedAt = OffsetDateTime.now()

        val saved = draftRepository.save(draft)
        workflowService.startApprovalForDraft(saved)
        return saved
    }

    @Transactional
    override fun sendDraftAsAnswer(draftId: Long, userId: String) : Draft {
        val draft = draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }

        if (draft.status != DraftStatus.APPROVED) {
            throw IllegalStateException("Draft must be approved before sending")
        }

        draft.status = DraftStatus.SENT
        draft.updatedAt = OffsetDateTime.now()

        return draftRepository.save(draft)
    }

    @Transactional
    override fun updateText(
        draftId: Long,
        newText: String,
        user: User
    ): Draft {
        val draft = draftRepository.findById(draftId)
            .orElseThrow { IllegalArgumentException("Draft $draftId not found") }

        if (draft.letter.sender != user.id) {
            throw BackendException(HttpStatus.FORBIDDEN, "Нет доступа")
        }

        // Разрешаем править только редактируемый драфт
        if (draft.status != DraftStatus.EDITABLE && draft.status != DraftStatus.GENERATING) {
            throw BackendException(HttpStatus.FORBIDDEN, "Не тот статус")
        }

        draft.text = newText
        draft.updatedAt = OffsetDateTime.now()

        return draftRepository.save(draft)
    }

    private fun convertToMap(text: String?): Map<String, Any>? {
        return try {
            objectMapper.readValue(text, Map::class.java) as Map<String, Any>
        } catch (e: Exception) {
            LOGGER.error("Error convernt to map", e)
            null
        }
    }
}
