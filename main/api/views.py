import datetime

from django.http import HttpRequest, JsonResponse
from main.api.serializers import (
    BattingSerializer,
    BowlingSerializer,
    FallOfWicketSerializer,
    FixtureSerializer,
    PlayerSerializer,
    ScoreSerializer,
    SeriesSerializer,
    SquadSerializer,
    TeamSerializer,
    VenueSerializer,
)
from main.models import (
    Batting,
    Bowling,
    FallOfWicket,
    Fixture,
    Player,
    Score,
    Series,
    Squad,
    Team,
    Venue,
)
from rest_framework import generics


class BulkCreate(generics.ListCreateAPIView):
    serializer_class = SeriesSerializer
    queryset = Series.objects.all()

    def post(self, request: HttpRequest):

        for item in request.data:
            series, _ = Series.objects.get_or_create(title=item.pop("title", None))

            for fixture in item.pop("fixtures", []):
                venue, _ = Venue.objects.get_or_create(name=fixture.pop("venue", None))

                [_team_a, _team_b] = [
                    (TeamSerializer(data=team))
                    for team in fixture.pop("teams", [None, None])
                ]

                if _team_a.is_valid(True):
                    (team_a, _) = Team.objects.get_or_create(**_team_a.validated_data)
                if _team_b.is_valid(True):
                    (team_b, _) = Team.objects.get_or_create(**_team_b.validated_data)

                # TODO
                fixture.pop("date")

                _fixture = FixtureSerializer(
                    data={
                        "series": series,
                        "venue": venue,
                        "team_a": team_a,
                        "team_b": team_b,
                        "date": datetime.datetime.now(),
                        **fixture,
                    }
                )

                if _fixture.is_valid(True):
                    self.instance = _fixture.save()

                    self.create_score(team_a, _team_a)
                    self.create_score(team_b, _team_b)

        return JsonResponse({"success": True})

    def create_score(self, team: Team, data: dict):
        data = data.initial_data
        [runs, balls] = str(data.pop("score", "0/0")).split("/")
        instance = Score(
            team=team,
            runs=runs,
            balls=balls,
            overs=data.get("overs", 0),
            fixture=self.instance,
        )
        instance.save()


class SeriesListApiView(generics.ListCreateAPIView, generics.DestroyAPIView):
    serializer_class = SeriesSerializer
    queryset = Series.objects.all()


class SeriesDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SeriesSerializer
    queryset = Series.objects.all()


class TeamListApiView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()


class TeamDetailView(generics.RetrieveAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()


class VenueListApiView(generics.CreateAPIView):
    serializer_class = VenueSerializer
    queryset = Venue.objects.all()


class VenueDetailView(generics.RetrieveAPIView):
    serializer_class = VenueSerializer
    queryset = Venue.objects.all()


class FixtureListApiView(generics.ListCreateAPIView):
    serializer_class = FixtureSerializer
    queryset = Fixture.objects.all()


class FixtureDetailView(generics.RetrieveAPIView):
    serializer_class = FixtureSerializer
    queryset = Fixture.objects.all()


class ScoreListApiView(generics.ListCreateAPIView):
    serializer_class = ScoreSerializer
    queryset = Score.objects.all()


class ScoreDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ScoreSerializer
    queryset = Score.objects.all()


class PlayerListApiView(generics.ListCreateAPIView):
    serializer_class = PlayerSerializer
    queryset = Player.objects.all()


class PlayerDetailView(generics.RetrieveAPIView):
    serializer_class = PlayerSerializer
    queryset = Player.objects.all()


class SquadListApiView(generics.ListCreateAPIView):
    serializer_class = SquadSerializer
    queryset = Squad.objects.all()


class SquadDetailView(generics.RetrieveAPIView):
    serializer_class = SquadSerializer
    queryset = Squad.objects.all()


class BattingListApiView(generics.ListCreateAPIView):
    serializer_class = BattingSerializer
    queryset = Batting.objects.all()


class BattingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BattingSerializer
    queryset = Batting.objects.all()


class BowlingListApiView(generics.ListCreateAPIView):
    serializer_class = BowlingSerializer
    queryset = Bowling.objects.all()


class BowlingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BowlingSerializer
    queryset = Bowling.objects.all()


class FallOfWicketListApiView(generics.ListCreateAPIView):
    serializer_class = FallOfWicketSerializer
    queryset = FallOfWicket.objects.all()


class FallOfWicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = FallOfWicketSerializer
    queryset = FallOfWicket.objects.all()
