package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Approver
import org.springframework.data.jpa.repository.JpaRepository

interface ApproverRepository : JpaRepository<Approver, Long> {

    fun findByNameIn(names: List<String>): List<Approver>
}