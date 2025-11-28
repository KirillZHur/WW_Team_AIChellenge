#!/bin/bash

echo "Поиск и удаление файлов *:Zone.Identifier ..."

# На WSL / Linux такие файлы выглядят как file.txt:Zone.Identifier
# Нужно удалить именно расширение после двоеточия

find . -type f -name "*:Zone.Identifier" -print -delete

echo "Готово!"
