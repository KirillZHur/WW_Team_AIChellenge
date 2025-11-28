package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.WorkflowTaskStatus
import mai.challenge.correspondence.entity.WorkflowTask

interface WorkflowService {

    fun startApprovalForDraft(draft: Draft)

    fun getTasksForAssignee(assignee: String, status: WorkflowTaskStatus?): List<WorkflowTask>

    fun approveTask(taskId: Long, approverId: String, comment: String?): WorkflowTask

    fun rejectTask(taskId: Long, approverId: String, comment: String): WorkflowTask
}