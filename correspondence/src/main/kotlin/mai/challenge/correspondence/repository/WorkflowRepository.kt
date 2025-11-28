package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.WorkflowTask
import mai.challenge.correspondence.entity.WorkflowTaskStatus
import org.springframework.data.jpa.repository.JpaRepository

interface WorkflowTaskRepository : JpaRepository<WorkflowTask, Long> {
    fun findAllByAssigneeAndStatus(assignee: String, status: WorkflowTaskStatus): List<WorkflowTask>
    fun findAllByDraftId(draftId: Long): List<WorkflowTask>
}