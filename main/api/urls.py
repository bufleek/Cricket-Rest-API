from django.urls import path

from .views import (
    BulkCreate,
    FixtureDetailView,
    FixtureListApiView,
    PlayerDetailView,
    PlayerListApiView,
    ScoreListApiView,
    SeriesDetailView,
    SeriesListApiView,
    TeamDetailView,
    TeamListApiView,
    VenueListApiView,
)

urlpatterns = [
    path("series/", SeriesListApiView.as_view()),
    path("series-bulk/", BulkCreate.as_view()),
    path("series/<int:pk>", SeriesDetailView.as_view()),
    path("teams/", TeamListApiView.as_view()),
    path("teams/<int:pk>", TeamDetailView.as_view()),
    path("fixtures/", FixtureListApiView.as_view()),
    path("fixtures/<int:pk>", FixtureDetailView.as_view()),
    path("players/", PlayerListApiView.as_view()),
    path("players/<int:pk>", PlayerDetailView.as_view()),
    path("venues/", VenueListApiView.as_view()),
    path("scores/", ScoreListApiView.as_view()),
]
