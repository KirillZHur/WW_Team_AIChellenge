package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Draft
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.GetDraftsResponse

interface DraftService {

    fun getDraftsForLetter(letterId: Long): GetDraftsResponse

    fun getDraft(draftId: Long): Draft

    fun submitForReview(draftId: Long, userId: String): Draft

    fun sendDraftAsAnswer(draftId: Long, userId: String) : Draft

    fun updateText(
        draftId: Long,
        newText: String,
        user: User
    ): Draft
}