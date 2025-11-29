package mai.challenge.correspondence.service.impl

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle
import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.repository.ApproverRepository
import mai.challenge.correspondence.repository.DraftRepository
import mai.challenge.correspondence.repository.LetterRepository
import mai.challenge.correspondence.service.LetterService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.OffsetDateTime

@Service
class LetterServiceImpl(
    private val letterRepository: LetterRepository,
    private val approverRepository: ApproverRepository,
    private val draftRepository: DraftRepository
) : LetterService {

    @Transactional(readOnly = true)
    override fun getLetters(
        user: User
    ): List<Letter> = letterRepository.findAllBySender(user.id!!)

    @Transactional
    override fun createLetter(
        file: MultipartFile,
        title: String,
        createdBy: User,
    ): Letter {
        val extractedText = "[TODO: parsed from file ${file.originalFilename}]"

        val approvers = approverRepository.findByNameIn(
            listOf(
                "запрос информации/документов",
                "Официальная жалоба или претензия",
                "Регуляторный запрос",
                "Партнёрское предложение",
                "Запрос на согласование",
                "Уведомление или информирование"
            )
        )

        val letter = Letter(
            title = title,
            body = extractedText,
            status = LetterStatus.NEW,
            sender = createdBy.id!!,
            summary = "не найдено",
            type = "не найдено",
            approvers = approvers
        )

        val response = letterRepository.save(letter)

        val draftStub1 = Draft(
            letter = response,
            style = DraftStyle.OFFICIAL_REGULATOR,
            status = DraftStatus.EDITABLE,
            text = "[Черновик в генерации]",
            version = 1,
            createdAt = OffsetDateTime.now(),
            updatedAt = OffsetDateTime.now()
        )

        val draftStub2 = Draft(
            letter = response,
            style = DraftStyle.CLIENT_FRIENDLY,
            status = DraftStatus.EDITABLE,
            text = "[Черновик в генерации]",
            version = 1,
            createdAt = OffsetDateTime.now(),
            updatedAt = OffsetDateTime.now()
        )

        draftRepository.saveAll(listOf(draftStub1, draftStub2))

        return response
    }

}

class NotFoundException(message: String) : RuntimeException(message)
