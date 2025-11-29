CREATE TABLE letters
(
    id          BIGSERIAL PRIMARY KEY,
    sender      UUID                     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title       VARCHAR(1000),
    summary     TEXT,
    body        TEXT,
    status      VARCHAR(50)              NOT NULL DEFAULT 'NEW',
    quickly     BOOLEAN NOT NULL DEFAULT FALSE,
    type        VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_letters_status ON letters (status);
CREATE INDEX idx_letters_type ON letters (type);
CREATE INDEX idx_letters_created ON letters (created_at);

-- ===============================
-- Approvers
-- ===============================

CREATE TABLE approvers
(
    id    BIGSERIAL PRIMARY KEY,
    name  TEXT NOT NULL,
    email VARCHAR(1000) NOT NULL
);

create unique index idx_approvers_name on approvers (name);


insert into approvers(name, email) values ('Запрос информации/документов', 'test1@email.com'),
                                          ('Официальная жалоба или претензия', 'test2@email.com'),
                                          ('Регуляторный запрос', 'test3@email.com'),
                                          ('Партнёрское предложение', 'test4@email.com'),
                                          ('Запрос на согласование', 'test5@email.com'),
                                          ('Уведомление или информирование', 'test6@email.com');

-- ===============================
-- latter_pprovers
-- ===============================

CREATE TABLE letter_approvers
(
    id          BIGSERIAL PRIMARY KEY,
    letter_id   BIGSERIAL,
    approver_id BIGSERIAL
);

create unique index uidx_letter_approvers on letter_approvers (letter_id, approver_id);
create index idx_letter_approvers_letter on letter_approvers (letter_id);
create index idx_letter_approvers_approver on letter_approvers (approver_id);


-- ===============================
-- DRAFTS
-- ===============================

CREATE TABLE drafts
(
    id          BIGSERIAL PRIMARY KEY,

    letter_id   BIGINT                   NOT NULL REFERENCES letters (id) ON DELETE CASCADE,

    style       VARCHAR(50)              NOT NULL,
    status      VARCHAR(50)              NOT NULL DEFAULT 'GENERATING',

    text        TEXT,
    version     INT                      NOT NULL DEFAULT 1,

    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    row_version BIGINT                            DEFAULT 0
);

CREATE INDEX idx_drafts_letter ON drafts (letter_id);
CREATE INDEX idx_drafts_status ON drafts (status);

-- ===============================
-- WORKFLOW TASKS
-- ===============================

CREATE TABLE workflow_tasks
(
    id           BIGSERIAL PRIMARY KEY,

    draft_id     BIGINT                   NOT NULL REFERENCES drafts (id) ON DELETE CASCADE,
    assignee     VARCHAR(100)             NOT NULL,

    status       VARCHAR(50)              NOT NULL DEFAULT 'PENDING',
    comment      TEXT,

    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflow_draft ON workflow_tasks (draft_id);
CREATE INDEX idx_workflow_assignee ON workflow_tasks (assignee);
CREATE INDEX idx_workflow_status ON workflow_tasks (status);

-- ===============================
-- NOTIFICATIONS
-- ===============================

CREATE TABLE notifications
(
    id         BIGSERIAL PRIMARY KEY,

    user_id    UUID REFERENCES users (id) ON DELETE CASCADE,
    message    TEXT                     NOT NULL,
    is_read    BOOLEAN                  NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (is_read);
