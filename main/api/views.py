import json

from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from main.api.serializers import (
    BattingSerializer,
    BowlingSerializer,
    FallOfWicketSerializer,
    FixtureSerializer,
    InningSerializer,
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
    Inning,
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
                try:
                    venue, _ = Venue.objects.get_or_create(
                        name=fixture.pop("venue", None)
                    )

                    [_team_a, _team_b] = [
                        (TeamSerializer(data=team))
                        for team in fixture.pop("teams", [None, None])
                    ]

                    if _team_a.is_valid(True):
                        (team_a, _) = Team.objects.get_or_create(
                            **_team_a.validated_data
                        )
                    if _team_b.is_valid(True):
                        (team_b, _) = Team.objects.get_or_create(
                            **_team_b.validated_data
                        )

                    _fixture = FixtureSerializer(
                        data={
                            "series": series,
                            "venue": venue,
                            "team_a": team_a,
                            "team_b": team_b,
                            **fixture,
                        }
                    )

                    if _fixture.is_valid(True):
                        self.instance = _fixture.save()

                        self.create_score(team_a, _team_a)
                        self.create_score(team_b, _team_b)
                except:
                    pass

        return JsonResponse({"success": True})

    def create_score(self, team: Team, data: dict):
        data = data.initial_data
        instance = Score(
            full_score=data.pop("full_score", ""),
            score=data.pop("score", ""),
            overs=data.get("overs", ""),
            fixture=self.instance,
            team=team,
        )
        instance.save()


class UpdateLiveView(generics.CreateAPIView):
    serializer_class = FixtureSerializer()
    query_set = Fixture.objects.all()

    def post(self, request, *args, **kwargs):
        data = request.data.get("data")
        _innings = data.pop("innings", None)
        _scores = data.pop("scores", None)

        Fixture.objects.filter(id=data.get("id", None)).update(**data)

        fixture = Fixture.objects.get(id=data.get("id", None))

        for _score in _scores:
            score = Score.objects.filter(
                team__id=_score.pop("team"), fixture__id=_score.pop("fixture")
            ).update(**_score)

        for _inning in _innings:
            team = fixture.team_a
            if not team.id is _inning.get("team"):
                team = fixture.team_b

            inning_filter = Inning.objects.filter(
                fixture=fixture,
                team=team,
                inning=_inning.get("inning"),
            )
            _inning.pop("team")
            _inning.pop("fixture")
            _inning.pop("id")
            _inning["batting"] = json.dumps(_inning.get("batting"))
            _inning["bowling"] = json.dumps(_inning.get("bowling"))
            inning_filter.update_or_create(**_inning, team=team, fixture=fixture)

        return JsonResponse({"status": "success"})


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
    queryset = Fixture.objects.all().order_by("-date")


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


class ScrapperLiveFixtureList(generics.ListAPIView):
    serializer_class = FixtureSerializer
    queryset = Fixture.objects.all()
    pagination_class = None

    def list(self, request, *args, **kwargs):
        fixtures = []
        for series_obj in request.data:
            series, _ = Series.objects.get_or_create(
                title=series_obj.pop("title", None)
            )

            for fixture_obj in series_obj.pop("fixtures"):
                _team_a = TeamSerializer(data=fixture_obj.pop("team_a", None))
                _team_b = TeamSerializer(data=fixture_obj.pop("team_b", None))

                fixture = Fixture.objects.filter(
                    team_a__name=_team_a.initial_data.get("name", None),
                    team_b__name=_team_b.initial_data.get("name", None),
                    date=fixture_obj.get("date"),
                ).first()

                if fixture is None:
                    (venue, _) = Venue.objects.get_or_create(
                        name=fixture_obj.pop("venue")
                    )

                    if _team_a.is_valid(True):
                        (team_a, _) = Team.objects.get_or_create(
                            **_team_a.validated_data
                        )

                    if _team_b.is_valid(True):
                        (team_b, _) = Team.objects.get_or_create(
                            **_team_b.validated_data
                        )

                    _fixture = FixtureSerializer(
                        data={
                            **fixture_obj,
                            "series": series,
                            "venue": venue,
                            "team_a": team_a,
                            "team_b": team_b,
                        }
                    )

                    if _fixture.is_valid(True):
                        fixture_instance = _fixture.save()
                        fixtures.append(_fixture.data)

                        Score.objects.create(
                            full_score=_team_a.initial_data.get("full_score"),
                            score=_team_a.initial_data.get("score"),
                            overs=_team_a.initial_data.get("overs"),
                            fixture=fixture_instance,
                            team=team_a,
                        )

                        Score.objects.create(
                            full_score=_team_b.initial_data.get("full_score"),
                            score=_team_b.initial_data.get("score"),
                            overs=_team_b.initial_data.get("overs"),
                            fixture=fixture_instance,
                            team=team_b,
                        )

                else:
                    serializer = FixtureSerializer(fixture)
                    fixtures.append(serializer.data)

        return JsonResponse(fixtures, safe=False)


class InningListView(generics.ListAPIView):
    serializer_class = InningSerializer
    queryset = Inning.objects.all()


class ScorecardDetailView(generics.ListAPIView):
    serializer_class = InningSerializer
    queryset = Inning.objects.all()
    pagination_class = None

    def retrieve(self, request, *args, **kwargs):
        innings = Inning.objects.filter(fixture__id=kwargs.get("fixture")).all()
        print(innings)
        return model_to_dict(innings)
