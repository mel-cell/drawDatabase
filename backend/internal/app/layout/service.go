package layout

import (
	"backend/internal/domain"
	"context"
)

type layoutService struct {
	repo domain.SchemaRepository
}

func NewLayoutService(repo domain.SchemaRepository) domain.LayoutService {
	return &layoutService{repo: repo}
}

func (s *layoutService) Save(ctx context.Context, layouts map[string]interface{}) error {
	return s.repo.SaveLayout(ctx, layouts)
}

func (s *layoutService) Get(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetLayout(ctx)
}
