package schema

import (
	"backend/internal/domain"
	"context"
)

type syncService struct {
	repo domain.SchemaRepository
}

func NewSyncService(repo domain.SchemaRepository) domain.SyncService {
	return &syncService{repo: repo}
}

func (s *syncService) GetSchema(ctx context.Context, dbName string) (*domain.DatabaseSchema, error) {
	return s.repo.GetFullSchema(ctx, dbName)
}

func (s *syncService) SyncBatch(ctx context.Context, dbName string, reqs []domain.TableRequest) error {
	return s.repo.SyncBatch(ctx, dbName, reqs)
}
