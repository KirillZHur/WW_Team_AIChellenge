package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import org.springframework.data.jpa.repository.JpaRepository

interface DraftRepository : JpaRepository<Draft, Long> {
    fun findAllByLetterId(letterId: Long): List<Draft>
    fun findAllByLetterIdAndStatus(letterId: Long, status: DraftStatus): List<Draft>
}