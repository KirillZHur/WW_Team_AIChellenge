package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.DraftSource
import mai.challenge.correspondence.entity.DraftStatus
import mai.challenge.correspondence.entity.DraftStyle

interface DraftService {

    fun getDraftsForLetter(letterId: Long): List<Draft>

    fun getDraft(draftId: Long): Draft

    fun createDraftFromLlm(letterId: Long, style: DraftStyle, createdBy: String): Draft

    fun updateDraft(draftId: Long, newText: String, expectedVersion: Int, updatedBy: String): Draft

    fun submitForReview(draftId: Long, userId: String): Draft

    fun sendDraftAsAnswer(draftId: Long, userId: String) : Draft
}