package mai.challenge.correspondence.service.impl

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.WorkflowTaskStatus
import mai.challenge.correspondence.entity.WorkflowTask
import mai.challenge.correspondence.repository.WorkflowTaskRepository
import mai.challenge.correspondence.service.WorkflowService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class WorkflowServiceImpl(
    private val workflowTaskRepository: WorkflowTaskRepository
) : WorkflowService {

    @Transactional
    override fun startApprovalForDraft(draft: Draft) {
        val task = WorkflowTask(
            draft = draft,
            assignee = "compliance_user", // TODO: взять из модельки
            status = WorkflowTaskStatus.PENDING
        )
        workflowTaskRepository.save(task)
    }

    @Transactional(readOnly = true)
    override fun getTasksForAssignee(assignee: String, status: WorkflowTaskStatus?): List<WorkflowTask> =
        if (status != null)
            workflowTaskRepository.findAllByAssigneeAndStatus(assignee, status)
        else
            workflowTaskRepository.findAll().filter { it.assignee == assignee }

    @Transactional
    override fun approveTask(taskId: Long, approverId: String, comment: String?): WorkflowTask {
        val task = workflowTaskRepository.findById(taskId)
            .orElseThrow { NotFoundException("Task $taskId not found") }

        if (task.status != WorkflowTaskStatus.PENDING) {
            throw IllegalStateException("Task is not pending")
        }

        task.status = WorkflowTaskStatus.COMPLETED
        task.comment = comment
        task.completedAt = OffsetDateTime.now()

        val saved = workflowTaskRepository.save(task)

        // черновик переводим в APPROVED
        val draft = task.draft
        draft.status = DraftStatus.APPROVED
        draft.updatedBy = approverId
        draft.updatedAt = OffsetDateTime.now()

        return saved
    }

    @Transactional
    override fun rejectTask(taskId: Long, approverId: String, comment: String): WorkflowTask {
        val task = workflowTaskRepository.findById(taskId)
            .orElseThrow { NotFoundException("Task $taskId not found") }

        if (task.status != WorkflowTaskStatus.PENDING) {
            throw IllegalStateException("Task is not pending")
        }

        task.status = WorkflowTaskStatus.COMPLETED
        task.comment = comment
        task.completedAt = OffsetDateTime.now()
        val saved = workflowTaskRepository.save(task)

        val draft = task.draft
        draft.status = DraftStatus.REJECTED
        draft.updatedBy = approverId
        draft.updatedAt = OffsetDateTime.now()

        return saved
    }
}