package mai.challenge.correspondence.service.impl

import mai.challenge.correspondence.repository.LetterRepository
import mai.challenge.correspondence.repository.DraftRepository
import mai.challenge.correspondence.config.client.LlmClient
import mai.challenge.correspondence.config.client.MailClient
import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftSource
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle
import mai.challenge.correspondence.service.WorkflowService
import mai.challenge.correspondence.service.DraftService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class DraftServiceImpl(
    private val letterRepository: LetterRepository,
    private val draftRepository: DraftRepository,
    private val llmClient: LlmClient,
    private val workflowService: WorkflowService,
    private val mailClient: MailClient
) : DraftService {

    @Transactional(readOnly = true)
    override fun getDraftsForLetter(letterId: Long): List<Draft> =
        draftRepository.findAllByLetterId(letterId)

    @Transactional(readOnly = true)
    override fun getDraft(draftId: Long): Draft =
        draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }


    @Transactional
    override fun createDraftFromLlm(letterId: Long, style: DraftStyle, createdBy: String): Draft {
        val letter = letterRepository.findById(letterId)
            .orElseThrow { NotFoundException("Letter $letterId not found") }

        val draft = Draft(
            letter = letter,
            style = style,
            status = DraftStatus.GENERATING,
            source = DraftSource.LLM,
            createdBy = createdBy
        )
        val saved = draftRepository.save(draft)

        val generatedText = llmClient.generateDraft(letter.body, style)

        saved.text = generatedText
        saved.status = DraftStatus.EDITABLE
        saved.updatedBy = createdBy
        saved.updatedAt = OffsetDateTime.now()

        return draftRepository.save(saved)
    }

    @Transactional
    override fun updateDraft(draftId: Long, newText: String, expectedVersion: Int, updatedBy: String): Draft {
        val draft = draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }

        if (draft.version != expectedVersion) {
            throw IllegalStateException("Draft version mismatch")
        }
        if (draft.status != DraftStatus.EDITABLE) {
            throw IllegalStateException("Draft is not editable")
        }

        val updatedDraft = draft.copy(
            id = 0, // создаем новую версию как отдельную запись
            text = newText,
            status = DraftStatus.EDITABLE,
            updatedBy = updatedBy,
            updatedAt = OffsetDateTime.now(),
            // business-версию увеличиваем
            // (можно и хранить в отдельной колонке, но у нас уже есть version)
            // +1 к version
            version = draft.version + 1
        )

        return draftRepository.save(updatedDraft)
    }

    @Transactional
    override fun submitForReview(draftId: Long, userId: String): Draft {
        val draft = draftRepository.findById(draftId)
            .orElseThrow { NotFoundException("Draft $draftId not found") }

        if (draft.status != DraftStatus.EDITABLE) {
            throw IllegalStateException("Draft is not editable")
        }

        draft.status = DraftStatus.ON_REVIEW
        draft.updatedBy = userId
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

        val letter = draft.letter
        // пока просто отправим на один адрес отправителя
        mailClient.sendMail(
            to = letter.sender ?: "unknown@local",
            subject = letter.subject,
            body = draft.text ?: ""
        )

        draft.status = DraftStatus.SENT
        draft.updatedBy = userId
        draft.updatedAt = OffsetDateTime.now()

        return draftRepository.save(draft)
    }
}
