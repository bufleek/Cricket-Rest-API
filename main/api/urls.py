from django.urls import path

from .views import (BulkCreate, FixtureDetailView, FixtureListApiView,
                    ScorecardDetailView, ScrapperLiveFixtureList,
                    SeriesApiListView, SeriesFixturesView, UpdateLiveView)

urlpatterns = [
    # path("series/", SeriesListApiView.as_view()),
    # path("series/<int:pk>", SeriesDetailView.as_view()),
    # path("teams/", TeamListApiView.as_view()),
    # path("teams/<int:pk>", TeamDetailView.as_view()),
    path("fixtures/<str:status>/", FixtureListApiView.as_view()),
    path("fixtures/<int:pk>/", FixtureDetailView.as_view()),
    path("fixtures/<int:fixture>/scorecard/", ScorecardDetailView.as_view()),
    path("series/", SeriesApiListView.as_view()),
    path("series/<int:series>/fixtures/", SeriesFixturesView.as_view()),
    # path("players/", PlayerListApiView.as_view()),
    # path("players/<int:pk>", PlayerDetailView.as_view()),
    # path("venues/", VenueListApiView.as_view()),
    # path("scores/", ScoreListApiView.as_view()),
    #
    ## SCRAPPER
    path("scrapper/series-bulk/", BulkCreate.as_view()),
    path("scrapper/get-live/", ScrapperLiveFixtureList.as_view()),
    path("scrapper/update-live/", UpdateLiveView.as_view()),
]
