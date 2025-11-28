CREATE TABLE letters (
                         id              BIGSERIAL PRIMARY KEY,
                         external_id     VARCHAR(255),
                         sender          VARCHAR(500),
                         subject         VARCHAR(1000),
                         body            TEXT,
                         status          VARCHAR(50) NOT NULL DEFAULT 'NEW',
                         sla_at          TIMESTAMP WITH TIME ZONE,
                         created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                         updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_letters_status ON letters(status);
Create Index idx_letters_sla ON letters(sla_at);
CREATE INDEX idx_letters_created ON letters(created_at);

-- ===============================
-- DRAFTS
-- ===============================

CREATE TABLE drafts (
                        id              BIGSERIAL PRIMARY KEY,

                        letter_id       BIGINT NOT NULL REFERENCES letters(id) ON DELETE CASCADE,

                        style           VARCHAR(50) NOT NULL,
                        status          VARCHAR(50) NOT NULL DEFAULT 'GENERATING',
                        source          VARCHAR(20) NOT NULL DEFAULT 'LLM',

                        text            TEXT,
                        version         INT NOT NULL DEFAULT 1,

                        created_by      VARCHAR(100) NOT NULL,
                        updated_by      VARCHAR(100),

                        created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                        updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                        row_version     BIGINT DEFAULT 0
);

CREATE INDEX idx_drafts_letter ON drafts(letter_id);
CREATE INDEX idx_drafts_status ON drafts(status);

-- ===============================
-- WORKFLOW TASKS
-- ===============================

CREATE TABLE workflow_tasks (
                                id              BIGSERIAL PRIMARY KEY,

                                draft_id        BIGINT NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
                                assignee        VARCHAR(100) NOT NULL,

                                status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                                comment         TEXT,

                                created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                                completed_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflow_draft ON workflow_tasks(draft_id);
CREATE INDEX idx_workflow_assignee ON workflow_tasks(assignee);
CREATE INDEX idx_workflow_status ON workflow_tasks(status);

-- ===============================
-- NOTIFICATIONS
-- ===============================

CREATE TABLE notifications (
                               id              BIGSERIAL PRIMARY KEY,

                               user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
                               message         TEXT NOT NULL,
                               is_read         BOOLEAN NOT NULL DEFAULT FALSE,

                               created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
