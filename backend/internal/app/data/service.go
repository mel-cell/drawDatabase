package data

import (
	"backend/internal/domain"
	"context"
)

type dataService struct {
	repo domain.SchemaRepository
}

func NewDataService(repo domain.SchemaRepository) domain.DataService {
	return &dataService{repo: repo}
}

func (s *dataService) GetData(ctx context.Context, table string, limit, offset int) (*domain.TableData, error) {
	return s.repo.GetTableData(ctx, table, limit, offset)
}

func (s *dataService) Insert(ctx context.Context, table string, data map[string]interface{}) error {
	return s.repo.InsertData(ctx, table, data)
}
