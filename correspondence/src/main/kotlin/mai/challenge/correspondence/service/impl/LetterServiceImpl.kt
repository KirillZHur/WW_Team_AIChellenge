package mai.challenge.correspondence.service.impl

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import mai.challenge.correspondence.repository.LetterRepository
import mai.challenge.correspondence.service.LetterService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class LetterServiceImpl(
    private val letterRepository: LetterRepository
) : LetterService {

    @Transactional(readOnly = true)
    override fun getLetters(
        status: LetterStatus?,
        beforeSla: OffsetDateTime?
    ): List<Letter> {
        var letters = letterRepository.findAll()
        status?.let { s -> letters = letters.filter { it.status == s } }
        beforeSla?.let { sla ->
            letters = letters.filter { it.slaAt != null && it.slaAt!!.isBefore(sla) }
        }
        return letters
    }

    @Transactional(readOnly = true)
    override fun getLetter(id: Long): Letter =
        letterRepository.findById(id).orElseThrow {
            NotFoundException("Letter $id not found")
        }

    @Transactional
    override fun createLetter(
        sender: String,
        subject: String,
        body: String,
        slaAt: OffsetDateTime?
    ): Letter {
        val letter = Letter(
            sender = sender,
            subject = subject,
            body = body,
            slaAt = slaAt
        )
        return letterRepository.save(letter)
    }

}

class NotFoundException(message: String) : RuntimeException(message)
