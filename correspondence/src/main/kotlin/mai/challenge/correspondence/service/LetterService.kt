package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import java.time.OffsetDateTime

interface LetterService {

    fun getLetters(
        status: LetterStatus?,
        beforeSla: OffsetDateTime?
    ): List<Letter>

    fun getLetter(id: Long): Letter

    fun createLetter(
        sender: String,
        subject: String,
        body: String,
        slaAt: OffsetDateTime?
    ): Letter
}