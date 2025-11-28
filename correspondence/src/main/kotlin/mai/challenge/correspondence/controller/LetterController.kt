package mai.challenge.correspondence.controller

import mai.challenge.correspondence.entity.LetterStatus
import mai.challenge.correspondence.model.CreateLetterRequest
import mai.challenge.correspondence.model.CreateLetterResponse
import mai.challenge.correspondence.model.toDetailsDto
import mai.challenge.correspondence.model.toSummaryDto
import mai.challenge.correspondence.service.LetterService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.OffsetDateTime

@RestController
@RequestMapping("/api/v1/letters")
class LetterController(
    private val letterService: LetterService
) {

    @GetMapping
    fun getLetters(
        @RequestParam(required = false) status: LetterStatus?,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        beforeSla: OffsetDateTime?
    ) = letterService.getLetters(status, beforeSla)
        .map { it.toSummaryDto() }

    @GetMapping("/{letterId}")
    fun getLetter(@PathVariable letterId: Long) =
        letterService.getLetter(letterId).toDetailsDto()

    @PostMapping
    fun createLetter(
        @RequestBody req: CreateLetterRequest
    ): CreateLetterResponse {
        val letter = letterService.createLetter(
            sender = req.sender,
            subject = req.subject,
            body = req.body,
            slaAt = req.slaAt
        )
        return CreateLetterResponse(
            id = letter.id,
            status = letter.status.name
        )
    }
}
