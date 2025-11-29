package mai.challenge.correspondence.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import mai.challenge.correspondence.client.AnalyzePdfRequest
import mai.challenge.correspondence.client.AnalyzePdfResponse
import mai.challenge.correspondence.config.client.AnalyzeClient
import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle
import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.exception.BackendException
import mai.challenge.correspondence.mapper.DraftStyleMapper.fromApi
import mai.challenge.correspondence.repository.ApproverRepository
import mai.challenge.correspondence.repository.DraftRepository
import mai.challenge.correspondence.repository.LetterRepository
import mai.challenge.correspondence.service.LetterService
import mai.challenge.correspondence.util.FileTextExtractor
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.OffsetDateTime

@Service
class LetterServiceImpl(
    private val letterRepository: LetterRepository,
    private val approverRepository: ApproverRepository,
    private val draftRepository: DraftRepository,
    private val analyzeClient: AnalyzeClient,
    private val objectMapper: ObjectMapper
) : LetterService {

    private val LOGGER = LoggerFactory.getLogger(LetterServiceImpl::class.java)

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
        val original = file.originalFilename ?: "file"
        if (!original.endsWith(".pdf") &&
            !original.endsWith(".txt") &&
            !original.endsWith(".docx")
        ) {
            throw BackendException(HttpStatus.FORBIDDEN, "Unsupported file type")
        }


        val extractedText = FileTextExtractor.extract(file)

        var analyzeResponse: AnalyzePdfResponse
        try {
            analyzeResponse = analyzeClient.analyze(
                AnalyzePdfRequest(
                    extractedText
                )
            )
        } catch (ex: Exception) {
            LOGGER.error("Error while calling llm", ex)
            throw BackendException(HttpStatus.BAD_GATEWAY, errorMessage = "Ошибка от llm")
        }

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
            summary = analyzeResponse.summary,
            type = analyzeResponse.letterType,
            approvers = approvers,
            facts = convertToJson(analyzeResponse.facts)
        )

        val response = letterRepository.save(letter)

        val drafts = analyzeResponse.drafts
            .map { Draft(
                letter = response,
                style = fromApi(it.style),
                status = DraftStatus.EDITABLE,
                text = it.text,
                version = 1,
                createdAt = OffsetDateTime.now(),
                updatedAt = OffsetDateTime.now()
            ) }

        draftRepository.saveAll(drafts)

        return response
    }

    private fun convertToJson(facts: Map<String, Object>): String? {
        try {
            return objectMapper.writeValueAsString(facts)
        } catch (ex: Exception) {
            LOGGER.error("Object mapper error", facts)
        }

        return null
    }

}

class NotFoundException(message: String) : RuntimeException(message)
