from django.urls import path
from . import views

urlpatterns = [
    path("series/", views.SeriesCreateListView.as_view()),
    path("series/<pk>/", views.SeriesDetailView.as_view()),
    path("teams/", views.TeamCreateView.as_view()),
    path("teams/<pk>/", views.TeamDetailView.as_view()),
    path("matches/", views.MatchListCreateView.as_view()),
    path("matches/<pk>/", views.MatchDetailView.as_view()),
]
