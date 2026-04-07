package database

import (
	"backend/internal/domain"
	"context"
)

type databaseService struct {
	repo domain.SchemaRepository
}

func NewDatabaseService(repo domain.SchemaRepository) domain.DatabaseService {
	return &databaseService{repo: repo}
}

func (s *databaseService) List(ctx context.Context) ([]string, error) {
	return s.repo.GetDatabases(ctx)
}

func (s *databaseService) Create(ctx context.Context, name string) error {
	return s.repo.CreateDatabase(ctx, name)
}

func (s *databaseService) Drop(ctx context.Context, name string) error {
	return s.repo.DropDatabase(ctx, name)
}
