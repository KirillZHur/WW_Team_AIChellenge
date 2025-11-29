package mai.challenge.correspondence.model

import mai.challenge.correspondence.entity.WorkflowTask
import mai.challenge.correspondence.entity.WorkflowTaskStatus
import java.time.OffsetDateTime

data class WorkflowTaskDto(
    val taskId: Long,
    val draftId: Long,
    val letterId: Long,
    val assignee: String,
    val status: WorkflowTaskStatus,
    val createdAt: OffsetDateTime,
    val completedAt: OffsetDateTime?
)

data class ApproveTaskRequest(
    val comment: String?
)

data class RejectTaskRequest(
    val comment: String
)

fun WorkflowTask.toDto() = WorkflowTaskDto(
    taskId = id,
    draftId = draft.id,
    letterId = draft.letter.id,
    assignee = assignee,
    status = status,
    createdAt = createdAt,
    completedAt = completedAt
)
